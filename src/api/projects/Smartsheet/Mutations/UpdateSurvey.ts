import { getSmartSheetClient, updateSheet, getCellData, getTaskNameColumnId } from "../SmartSheetServices"
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
export const updateSurvey = async (root, args, context) => {

    let sheetResponse;
    try{
        const validationResponse = await validateSurveyUpdateData(args);
        if(validationResponse){
            return validationResponse;
        }
        const {smartSheetId, surveyExecutiveEmail} = args;
        const  smartClient = await getSmartSheetClient();
        const sheetData = await smartClient.sheets.getSheet({id : smartSheetId});
        //Update Survey Email to related Milestones in SmartSheet.
        const rowArray = await getSurveyUpdateData(sheetData, surveyExecutiveEmail);
        await updateSheet(smartClient, rowArray, smartSheetId);
        sheetResponse = { code: 200, message: "success"}
        return sheetResponse

  } catch (error) {
    sheetResponse = { code: 400, message: error.message }
    return sheetResponse
  }
}
const validateSurveyUpdateData = async (args) => {
    var surveyResponse;
    const emailReg =  /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if(!args.smartSheetId){
        surveyResponse = { code: 400, message: "Please Enter Valid Smartsheet Id"};
    }
    if(!emailReg.test(args.surveyExecutiveEmail)){
        surveyResponse = { code: 400, message: "Please Enter Valid Email"}
    }
    return surveyResponse;
}
const getSurveyUpdateData = async (sheetData, surveyExecutiveEmail) => {

    const rowArray = [];
    let assignedToColumnId;
    const taskNameColumnId = await getTaskNameColumnId(sheetData);
    sheetData.columns.forEach((column) => {
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ASSIGN_TO ) {
            assignedToColumnId = column.id;
        }
    });
    for (var row of sheetData.rows) {
        for (var cell of row.cells) {
            const cellValue = cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
            if (cellValue && cellValue === SmartSheetCellValueEnum.SITE_SURVEY && cell.columnId === taskNameColumnId) {
                rowArray.push(await getCellData(row.id, assignedToColumnId, surveyExecutiveEmail));
            }
        }
    }
    return rowArray;
}
