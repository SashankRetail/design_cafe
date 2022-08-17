import { getSmartSheetClient, updateSheet, getProjectBySheetId, getDelayDays, getTaskNameColumnId} from "../SmartSheetServices"
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
import ProjectMileStoneEnum from "../../../../domain/enumerations/ProjectMileStoneEnum";
import ProjectMileStonesUtil from "../../../../utils/ProjectMileStoneUtil";
import { prisma } from "../../../../prismaConfig";
export const updateMilestone = async (root, args, context) => {

    let sheetResponse;
    try{
        const validationResponse = await validateMilestoneUpdateData(args);
        if(validationResponse){
            return validationResponse;
        }
        const  smartClient = await getSmartSheetClient();
        const sheetData = await smartClient.sheets.getSheet({id : args.smartSheetId});
        args.actualStartDate = await getPreviousMileStoneFinishDate(sheetData, args);
        const rowArray = await getMileStoneUpdateData(sheetData, args);
        await updateSheet(smartClient, rowArray, args.smartSheetId);
        await updateCurrentMileStone(sheetData, args);
        sheetResponse = { code: 200, message: "success"}
        return sheetResponse

  } catch (error) {
    sheetResponse = { code: 400, message: error.message }
    return sheetResponse
  }
}
const validateMilestoneUpdateData = async (args) => {
    var milestoneResponse;
    if(!args.smartSheetId){
        milestoneResponse = { code: 400, message: "Please Enter Valid Smartsheet Id" }
    }
    if(!args.mileStoneName){
        milestoneResponse = { code: 400, message: "Please Enter Valid mileStoneName" }
    }
    if(!args.actualFinishDate){
        milestoneResponse = { code: 400, message: "Please Enter Valid actualFinishDate" }
    }
    return milestoneResponse;
}
const updateCurrentMileStone = async (sheetData, args) => {
    let projectDelay;
    const project = await getProjectBySheetId(args.smartSheetId);
    const currentMileStone = await getCurrentMileStone(args,project.milestones);
    const currentSmartsheetMileStone = ProjectMileStonesUtil.getSheetMileStoneName(currentMileStone.toLowerCase().trim());
    const columnIds = await getColumnJson(sheetData);
    for (var row of sheetData.rows) {
        for (var cell of row.cells) {
            const cellValue = cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
            if (cellValue === currentSmartsheetMileStone) {
                projectDelay = await getProjectDelay(row,columnIds);
            }
        }
    }
    await prisma.dc_projects.update({
        data: {currentmilestone : currentMileStone, projectdelay : projectDelay},
        where: { id : project.id }
        });
}
const getCurrentMileStone = async (args, milestones) => {
    var i,currentMileStone;
    const mileStoneName = args.mileStoneName.toLowerCase().trim();
    milestones = milestones.attributes.milestone_details;
    for(i=0; i<milestones.length; i++){
        if(milestones[i].label.toLowerCase().trim() === mileStoneName){
            currentMileStone = milestones[i+1].label.trim();
        }
    }
    return currentMileStone;
}
const getColumnJson = async (sheetData) => {
    let originalEndDateColumnId, forecastedEndDateColumnId;
    sheetData.columns.forEach((column) =>{
      const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
      switch (columnTitle) {
        case SmartSheetColumnNameEnum.ORIGINAL_PLANNED_FINISH_DATE:{
            originalEndDateColumnId = column.id;
            break;
        }
        case SmartSheetColumnNameEnum.CURRENT_FORECAST_FINISH:{
        forecastedEndDateColumnId = column.id;
        break;
        }
      }
    });
    return {"originalEndDateColumnId" : originalEndDateColumnId, "forecastedEndDateColumnId" : forecastedEndDateColumnId};
  }
  const getProjectDelay = async (row,columnIds) => {
    let originalEndDate, forecastedEndDate;
    let delayStatus = "onTime";
    row.cells.forEach((cell) => {
      switch (cell.columnId) {
        case columnIds.originalEndDateColumnId:{
          originalEndDate = cell.value;
          break;
        }
        case columnIds.forecastedEndDateColumnId:{
          forecastedEndDate = cell.value;
          break;
        }
      }
    });
    const delayDays = await getDelayDays(new Date(forecastedEndDate), new Date(originalEndDate));
    if(delayDays > 0){
      delayStatus = "delayed"
    }
    return delayStatus;
  }
const getPreviousMileStoneFinishDate = async (sheetData, args) => {
    let actualFinishDate;
    const project = await getProjectBySheetId(args.smartSheetId);
    const previousMileStone = await getPreviousMileStone(args,project.milestones);
    const smartsheetPreviousMileStone = ProjectMileStonesUtil.getSheetMileStoneName(previousMileStone.toLowerCase().trim());
    const actualFinishDateColumnId = await getActualFinishDateColumnId(sheetData);
    for (var row of sheetData.rows) {
        for (var cell of row.cells) {
            const cellValue = cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
            if (cellValue === smartsheetPreviousMileStone) {
                actualFinishDate = await getActualFinishDate(row, actualFinishDateColumnId);
            }
        }
    }
    return actualFinishDate;
}
const getPreviousMileStone = async (args, milestones) => {
    var i,previousMileStone;
    const mileStoneName = args.mileStoneName.toLowerCase().trim();
    milestones = milestones.attributes.milestone_details;
    for(i=0; i<milestones.length; i++){
        if(milestones[i].label.toLowerCase().trim() === mileStoneName){
            previousMileStone = milestones[i-1].label.trim();
        }
    }
    return previousMileStone;
}
const getActualFinishDateColumnId = async (sheetData) => {
    let actualFinishDateColumnId;
    sheetData.columns.forEach((column) =>{
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if(columnTitle === SmartSheetColumnNameEnum.ACTUAL_FINISH) {
            actualFinishDateColumnId = column.id
        }
    });
    return actualFinishDateColumnId;
}
const getActualFinishDate = async (row, actualFinishDateColumnId) => {
    let actualFinishDate;
    row.cells.forEach((cell) => {
        if(cell.columnId === actualFinishDateColumnId) {
            actualFinishDate = cell.value;
        }
    });
    return actualFinishDate;
}
const getMileStoneUpdateData = async (sheetData, args) => {
    const mileStone = args.mileStoneName.toLowerCase().trim();
    const rowArray = [];
    const taskNameColumnId = await getTaskNameColumnId(sheetData);
    for (var row of sheetData.rows) {
        for (var cell of row.cells) {
            const cellValue = cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
            if(cellValue && cell.columnId === taskNameColumnId){
                if (cellValue === SmartSheetCellValueEnum.PROJECT_SIGNUP && mileStone === ProjectMileStoneEnum.PROJECT_SIGNUP) {
                    const projectSignup = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(projectSignup);
                }
                else if ((cellValue === SmartSheetCellValueEnum.SITE_SURVEY ||
                    cellValue === SmartSheetCellValueEnum.SITE_SURVEY_COMPLETE) && mileStone === ProjectMileStoneEnum.SITE_SURVEY) {
                    const siteSurvey = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(siteSurvey);
                }
                else if (cellValue === SmartSheetCellValueEnum.KNOW_YOUR_CLIENT && mileStone === ProjectMileStoneEnum.KNOW_YOUR_CLIENT) {
                    const kyc = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(kyc);
                }
                else if ((cellValue === SmartSheetCellValueEnum.FIRST_CUT_MEETING ||
                    cellValue === SmartSheetCellValueEnum.DESIGN_PRESENTATION) && mileStone === ProjectMileStoneEnum.DESIGN_PRESENTATION) {
                    const designPresentation = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(designPresentation);
                }
                else if (cellValue === SmartSheetCellValueEnum.DESIGN_FINALIZATION && mileStone === ProjectMileStoneEnum.DESIGN_FINALIZATION) {
                    const designFinalization = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(designFinalization);
                }
                else if (cellValue === SmartSheetCellValueEnum.REQUEST_PM_FOR_KICKOFF && mileStone === ProjectMileStoneEnum.SITE_VALIDATION_REQUEST) {
                    const siteValidation = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(siteValidation);
                }
                else if (cellValue === SmartSheetCellValueEnum.KICKOFF_MEETING_AT_SITE && mileStone === ProjectMileStoneEnum.SITE_VALIDATION_MEETING) {
                    const siteValidationMeeting = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(siteValidationMeeting);
                }
                else if (cellValue === SmartSheetCellValueEnum.DWG_REVISIONS && mileStone === ProjectMileStoneEnum.POST_SITE_VALIDATION_REVISION) {
                    const postSiteValidation = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(postSiteValidation);
                }
                else if (cellValue === SmartSheetCellValueEnum.GFC_CHECKING && mileStone === ProjectMileStoneEnum.GFC_CHECKING) {
                    const gfcCheking = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(gfcCheking);
                }
                else if ((cellValue === SmartSheetCellValueEnum.DESIGN_SIGN_OFF ||
                    cellValue === SmartSheetCellValueEnum.DESIGN_SIGN_OFF_PRESENTATION) && mileStone === ProjectMileStoneEnum.DESIGN_SIGNOFF) {
                    const designSignOff = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(designSignOff);
                }
                else if (cellValue === SmartSheetCellValueEnum.PROJECT_RECEIVED_FOR_PLANNING && mileStone === ProjectMileStoneEnum.PRODUCTION_REQUEST) {
                    const productionRequest = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(productionRequest);
                }
                else if (cellValue === SmartSheetCellValueEnum.THIRTYFIVE_PAYMENT_CONFIRMATION && mileStone === ProjectMileStoneEnum.THIRTYFIVE_PAYMENT) {
                    const thirtyfivePayment = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(thirtyfivePayment);
                }
                else if (cellValue === SmartSheetCellValueEnum.PRODUCTION && mileStone === ProjectMileStoneEnum.PRODUCTION) {
                    const production = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(production);
                }
                else if ((cellValue === SmartSheetCellValueEnum.READY_FOR_DISPATCH ||
                    cellValue === SmartSheetCellValueEnum.PENDING_HARDWARE_QC) && mileStone === ProjectMileStoneEnum.READY_FOR_DISPATCH) {
                    const readyDispatch = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(readyDispatch);
                }
                else if (cellValue === SmartSheetCellValueEnum.READY_FOR_HANDOVER && mileStone === ProjectMileStoneEnum.READY_FOR_HANDOVER) {
                    const readyHandover = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(readyHandover);
                }
                else if (cellValue === SmartSheetCellValueEnum.HANDOVER && mileStone === ProjectMileStoneEnum.HANDOVER) {
                    const handover = await gemileStoneCellData(sheetData, args, row.id);
                    rowArray.push(handover);
                }
            }
        }
    }
    return rowArray;
}
const gemileStoneCellData = async (sheetData, args, rowId) => {

    let actualStartColumnId, actualFinishColumnId, taskStatusColumnId;
    const taskStatus = "Complete";
    sheetData.columns.forEach((column) => {
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ACTUAL_START) {
            actualStartColumnId = column.id;
        }
        else if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ACTUAL_FINISH) {
            actualFinishColumnId = column.id;
        }
        else if (columnTitle && columnTitle === SmartSheetColumnNameEnum.TASK_STATUS) {
            taskStatusColumnId = column.id;
        }
    });
    const cells = [{"columnId": actualStartColumnId,"value": new Date(args.actualStartDate)},
    {"columnId": actualFinishColumnId,"value": new Date(args.actualFinishDate)},
    {"columnId": taskStatusColumnId,"value": taskStatus}];
    return {"id" : rowId, cells :cells};
}
