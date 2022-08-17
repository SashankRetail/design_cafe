import { getSmartSheetClient, updateSheet, getCellData } from "../SmartSheetServices"
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
export const updateProjectValue = async (root, args, context) => {

    let sheetResponse;
    try{

        const {smartSheetId, projectValue} = args;
        if(!smartSheetId){
            sheetResponse = { code: 400, message: "Please Enter Valid Smartsheet Id"};
            return sheetResponse
        }
        const  smartClient = await getSmartSheetClient();
        const sheetData = await smartClient.sheets.getSheet({id : smartSheetId});
        const rowArray = await getProjectValueUpdateData(sheetData, projectValue);
        await updateSheet(smartClient, rowArray, smartSheetId);
        sheetResponse = { code: 200, message: "success"};
        return sheetResponse

  } catch (error) {
    sheetResponse = { code: 400, message: error.message }
    return sheetResponse
  }
}

const getProjectValueUpdateData = async (sheetData, projectValue) => {

    const rowArray = [];
    let summaryDetailsColumnId;
    sheetData.columns.forEach((column) => {
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.SUMMARY_DETAILS) {
            summaryDetailsColumnId = column.id;
        }
    });
    for (var row of sheetData.rows) {
        for (var cell of row.cells) {
            const cellValue = cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
            if (cellValue && cellValue === SmartSheetCellValueEnum.PROJECT_SIGNUP_VALUE) {
                rowArray.push(await getCellData(row.id, summaryDetailsColumnId, projectValue));
            }
        }
    }
    return rowArray;
}
