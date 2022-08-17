import { getSmartSheetClient, updateSheet, getTaskNameColumnId} from "../SmartSheetServices"
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
export const updatePaymentChecklist = async (_root, args, _context) => {

    let sheetRes;
    try{
        const validResponse = await validateChecklistUpdateData(args);
        if(validResponse){
            return validResponse;
        }
        const  smartSheetClient = await getSmartSheetClient();
        const smartSheetData = await smartSheetClient.sheets.getSheet({id : args.smartSheetId});
        const checklistArray = await getChecklistUpdateData(smartSheetData, args);
        await updateSheet(smartSheetClient, checklistArray, args.smartSheetId);

        sheetRes = { code: 200, message: "success"}
        return sheetRes

  } catch (error) {
    sheetRes = { code: 400, message: error.message }
    return sheetRes
  }
}
const getChecklistUpdateData = async (sheetData, args) => {
    const checklistName = args.mileStoneName.toLowerCase().trim();
    const taskColumnId = await getTaskNameColumnId(sheetData);
    const checklistRowArray = [];

    for (let row of sheetData.rows) {
        for (let cell of row.cells) {
            const cellValue = await getCellValue(cell);
            if(cellValue && cell.columnId === taskColumnId){
                if (cellValue === checklistName) {
                    checklistRowArray.push(await getChecklistCellData(sheetData, args, row.id));
                }
            }
        }
    }
    return checklistRowArray;
}
const getChecklistCellData = async (sheetData, args, rowId) => {

    let actualStartId, actualFinishId, taskStatusId;
    const taskStatus = "Complete";
    sheetData.columns.forEach((column) => {
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ACTUAL_START) {
            actualStartId = column.id;
        }
        else if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ACTUAL_FINISH) {
            actualFinishId = column.id;
        }
        else if (columnTitle && columnTitle === SmartSheetColumnNameEnum.TASK_STATUS) {
            taskStatusId = column.id;
        }
    });
    const cells = [{"columnId": actualStartId,"value": new Date(args.actualStartDate)},
    {"columnId": actualFinishId,"value": new Date(args.actualFinishDate)},
    {"columnId": taskStatusId,"value": taskStatus}];
    return {"id" : rowId, cells :cells};
}
const getCellValue = async (cell) => {
    return cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
};
const validateChecklistUpdateData = async (args) => {
    let checklistResponse;
    if(!args.smartSheetId){
        checklistResponse = { code: 400, message: "Please Enter Valid Smartsheet Id" }
    }
    if(!args.mileStoneName){
        checklistResponse = { code: 400, message: "Please Enter Valid mileStoneName" }
    }
    if(!args.actualFinishDate){
        checklistResponse = { code: 400, message: "Please Enter Valid actualFinishDate" }
    }
    if(!args.actualStartDate){
        checklistResponse = { code: 400, message: "Please Enter Valid actualStartDate" }
    }
    return checklistResponse;
}
