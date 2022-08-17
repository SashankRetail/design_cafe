import {
  getSmartSheetClient,
  updateSheet,
  getCellData,
  getTaskNameColumnId,
} from "../SmartSheetServices";
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
export const updateDesignerEmail = async (root, args, context) => {
  let SheetResponse;
  try {
    const validationResponse = await validateDesignerUpdateData(args);
    if (validationResponse) {
      return validationResponse;
    }
    const { smartSheetId, designerEmail } = args;
    const smartClient = await getSmartSheetClient();
    const sheetData = await smartClient.sheets.getSheet({ id: smartSheetId });
    //Update Designer Email to related Milestones in SmartSheet.
    const rowArray = await getDesignerUpdateData(sheetData, designerEmail);
    await updateSheet(smartClient, rowArray, smartSheetId);
    SheetResponse = { code: 200, message: "success" };
    return SheetResponse;
  } catch (error) {
    SheetResponse = { code: 400, message: error.message };
    return SheetResponse;
  }
};
const validateDesignerUpdateData = async (args) => {
  var designerResponse;
  const emailReg =
    /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  if (!args.smartSheetId) {
    designerResponse = {
      code: 400,
      message: "Please Enter Valid Smartsheet Id",
    };
  }
  if (!emailReg.test(args.designerEmail)) {
    designerResponse = { code: 400, message: "Please Enter Valid Email" };
  }
  return designerResponse;
};
const getDesignerUpdateData = async (sheetData, designerEmail) => {
  const rowArray = [];
  const assignedToColumnId = await getAssignedColumnId(sheetData);
  const taskNameColumnId = await getTaskNameColumnId(sheetData);
  for (var row of sheetData.rows) {
    for (var cell of row.cells) {
      const cellValue = cell.displayValue
        ? cell.displayValue.toLowerCase().trim()
        : null;
      if (cell.columnId === taskNameColumnId) {
        if (cellValue === SmartSheetCellValueEnum.DESIGN_STAGE) {
          const designStage = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(designStage);
        } else if (cellValue === SmartSheetCellValueEnum.KNOW_YOUR_CLIENT) {
          const knowyourClient = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(knowyourClient);
        } else if (cellValue === SmartSheetCellValueEnum.FIRST_CUT_MEETING) {
          const firstCutMeeting = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(firstCutMeeting);
        } else if (cellValue === SmartSheetCellValueEnum.DESIGN_FINALIZATION) {
          const designFinalization = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(designFinalization);
        } else if (
          cellValue === SmartSheetCellValueEnum.REQUEST_PM_FOR_KICKOFF
        ) {
          const requestPMKickOff = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(requestPMKickOff);
        } else if (cellValue === SmartSheetCellValueEnum.DWG_REVISIONS) {
          const dwgRevisions = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(dwgRevisions);
        } else if (cellValue === SmartSheetCellValueEnum.DESIGN_SIGN_OFF) {
          const designSignOff = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(designSignOff);
        } else if (
          cellValue === SmartSheetCellValueEnum.PROJECT_RECEIVED_FOR_PLANNING
        ) {
          const projectReceivedPlanning = await getCellData(
            row.id,
            assignedToColumnId,
            designerEmail
          );
          rowArray.push(projectReceivedPlanning);
        }
      }
    }
  }
  return rowArray;
};
const getAssignedColumnId = async (sheetData) => {
  let assignedToColumnId;
  sheetData.columns.forEach((column) => {
    const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
    if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ASSIGN_TO) {
      assignedToColumnId = column.id;
    }
  });
  return assignedToColumnId;
};
