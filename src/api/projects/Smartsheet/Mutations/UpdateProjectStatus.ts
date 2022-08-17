import { getSmartSheetClient, updateSheet, getCellData, getProjectBySheetId, getHandoverDate} from "../SmartSheetServices"
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
import ProjectMileStoneEnum from "../../../../domain/enumerations/ProjectMileStoneEnum";
import { prisma } from "../../../../prismaConfig";
import dayjs from "dayjs";
export const updateProjectStatus = async (root, args, context) => {

    let sheetResponse;
    try{
        const validationResponse = await validateStatusUpdateData(args);
        if(validationResponse){
            return validationResponse;
        }
        const {smartSheetId, projectStatus, signupDate} = args;
        const  smartClient = await getSmartSheetClient();
        const sheetData = await smartClient.sheets.getSheet({id : smartSheetId});
        const rowArray = await getProjectStatusUpdateData(sheetData, projectStatus, signupDate);
        await updateSheet(smartClient, rowArray, smartSheetId);
        await currentMileStone(smartSheetId, smartClient);
        sheetResponse = { code: 200, message: "success"};
        return sheetResponse

  } catch (error) {
    sheetResponse = { code: 400, message: error.message }
    return sheetResponse
  }
}
const validateStatusUpdateData = async (args) => {
    const {smartSheetId, projectStatus, signupDate} = args;
    var statusResponse;
    if(!smartSheetId){
        return { code: 400, message: "Please Enter Valid Smartsheet Id"};
    }
    if(!projectStatus){
        statusResponse = { code: 400, message: "Please Enter Valid Status"};
    }
    if(!signupDate){
        statusResponse = { code: 400, message: "Please Enter Valid SignUp Date"};
    }
    return statusResponse
}
const currentMileStone = async (smartSheetId, smartClient) => {
    const project = await getProjectBySheetId(smartSheetId);
    const sheetObject = await smartClient.sheets.getSheet({id : smartSheetId});
    const handoverDate = await getHandoverDate(sheetObject);
    await prisma.dc_projects.update({
        data: {currentmilestone : ProjectMileStoneEnum.DEFAULT_CURRENT_MILESTONE,expectedhandoverdate : new Date(handoverDate)},
        where: { id : project.id }
        });

}
const getColumnIds = async (sheetData) => {
    let summaryDetailsColumnId, actualStartId, actualFinishId, originalPlannedStartId;
    for (var column of sheetData.columns) {
        const columnTitle = await getColumnTitle(column);
        if (columnTitle === SmartSheetColumnNameEnum.SUMMARY_DETAILS ) {
            summaryDetailsColumnId = column.id;
        }
        else if (columnTitle === SmartSheetColumnNameEnum.ACTUAL_START) {
            actualStartId = column.id;
        }
        else if (columnTitle === SmartSheetColumnNameEnum.ACTUAL_FINISH) {
            actualFinishId = column.id;
        }
        else if (columnTitle === SmartSheetColumnNameEnum.ORIGINAL_PLANNED_START_DATE) {
            originalPlannedStartId = column.id;
        }
    }
    return {"summaryDetailsColumnId":summaryDetailsColumnId,"actualStartId":actualStartId,"actualFinishId":actualFinishId,"originalPlannedStartId":originalPlannedStartId};
}
const getProjectStatusUpdateData = async (sheetData, projectStatus, signupDate) => {
    const statusRowArray = [];
    const date = dayjs(signupDate).format("YYYY-MM-DD");
    const columnIds = await getColumnIds(sheetData);
    for (var row of sheetData.rows) {
        for (var cell of row.cells) {
            const cellValue = await getCellValue(cell);
            if (cellValue && cellValue === SmartSheetCellValueEnum.STATUS) {
                statusRowArray.push(await getCellData(row.id, columnIds.summaryDetailsColumnId, projectStatus));
            }
            else if (cellValue === SmartSheetCellValueEnum.PROJECT_SIGNUP) {
                const cells = [{"columnId": columnIds.actualStartId,"value": new Date(date)},
                {"columnId": columnIds.actualFinishId,"value": new Date(date)},
                {"columnId": columnIds.originalPlannedStartId,"value": new Date(date)}];
                const clientCellObject = {"id" : row.id, cells :cells};
                statusRowArray.push(clientCellObject);
            }
        }
    }
    return statusRowArray;
}
const getColumnTitle = async (column) => {
    return column.title ? column.title.toLowerCase().trim() : null;
}
const getCellValue = async (cell) => {
    return cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
}
