import { getSmartSheetClient, updateSheet, getCellData } from "../SmartSheetServices"
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
export const updateProjectAddress = async (root, args, context) => {

    let sheetResponse;
    try{
        const validationResponse = await validateAddressUpdateData(args);
        if(validationResponse){
            return validationResponse;
        }
        const {smartSheetId, projectAddress} = args;
        const  smartClient = await getSmartSheetClient();
        const sheetData = await smartClient.sheets.getSheet({id : smartSheetId});

        const rowArray = await getProjectAddressUpdateData(sheetData, projectAddress);
        await updateSheet(smartClient, rowArray, smartSheetId);

        sheetResponse = { code: 200, message: "success"}
        return sheetResponse

  } catch (error) {
    sheetResponse = { code: 400, message: error.message }
    return sheetResponse
  }
}
const validateAddressUpdateData = async (args) => {
    var addressResponse;
    if(!args.smartSheetId){
        addressResponse = { code: 400, message: "Please Enter Valid Smartsheet Id" }
    }
    if(!args.projectAddress){
        addressResponse = { code: 400, message: "Please Enter Valid Address" }
    }
    return addressResponse;
}
const getProjectAddressUpdateData = async (sheetData, projectAddress) => {

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
            if (cellValue && cellValue === SmartSheetCellValueEnum.PROPERTY_ADDRESS) {
                rowArray.push(await getCellData(row.id, summaryDetailsColumnId, projectAddress));
            }
        }
    }
    return rowArray;
}
