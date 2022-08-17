import { prisma } from "../../../prismaConfig";
import SmartSheetColumnNameEnum from "../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../domain/enumerations/SmartSheetCellValueEnum";

/*Create SmartSheet client Object and return the same*/
export async function getSmartSheetClient(){

    const smartSdk = require("smartsheet");
    return smartSdk.createClient({
    accessToken: process.env.smartSheetAccessToken,
    logLevel: "info"
    });
}

/* It will take two parameter SmartSheet Client Object and SheetName and
    Create a Sheet using existing template in specific workspace and
    return the SheetID. */
    export async function createSheet(smartClient, sheetName){

    var sheet = {
        "fromId": process.env.smartSheetTemplateId,
        "name": sheetName
        };
    // Set options
    var options = {
        workspaceId: process.env.smartSheetWorkspaceId,
        body: sheet,
        queryParameters : {
            include: 'attachments,data,discussions'
        }
    };
    // Create sheet from template in the specified workspace
    const sheetDetails = await smartClient.sheets.createSheetFromExisting(options);
    return sheetDetails.result.id;
}

/* It will take three parameter SmartSheet Client Object and SheetID and UpdateRowJson Object
    and return Update details*/
    export async function updateSheet(smartClient, rowArray, sheetId){
    var updateRow = {
        sheetId: sheetId,
        body: rowArray
    };
    // Update rows in sheet
    return smartClient.sheets.updateRow(updateRow);
}

/* It will take three parameter row ID, column ID and Cell value and
return cell Details , which is used for update cell value.*/
export async function getCellData(rowId, columnId, value){

    const cells = [{"columnId": columnId,"value": value}];
    return {"id" : rowId, cells :cells};
}

/* It will take smartsheet ID as  parameter fetch project from DB and
return project details*/
export async function getProjectBySheetId(smartSheetId){

    return prisma.dc_projects.findFirst({
        where: { smartsheetid : smartSheetId},
      });
}

/* It will take smartsheet as  parameter and return the handover date.*/
export async function getHandoverDate(smartSheetData){

    let handoverDate = null;
    const handoverColumnIds = await getHandoverColumnId(smartSheetData);
    handoverDate = await getRevisedHandoverDate(smartSheetData, handoverColumnIds.actualStartDateColumnId,handoverDate);
    handoverDate = await getActualHandoverDate(smartSheetData, handoverColumnIds.actualStartDateColumnId,handoverDate);
    handoverDate = await getForecastedHandoverDate(smartSheetData, handoverColumnIds.forecastedFnishDateColumnId,handoverColumnIds.originalEndDateColumnId, handoverDate);
    handoverDate = await getReadyHandoverDate(smartSheetData, handoverColumnIds.forecastedFnishDateColumnId, handoverDate);
    return handoverDate;
}

/* It will Create & enable Web-hook in a sheet*/
export async function createWebHook(targetSheetId, hookName){

    let webhook = null;
    const smartClient = await getSmartSheetClient();
    // Get all hooks.
    const listHooksResponse = await smartClient.webhooks.listWebhooks({
        includeAll: true
    });
    // Check for existing hooks on this sheet for this app
    for (const hook of listHooksResponse.data) {
        if (hook.scopeObjectId === targetSheetId && hook.name === hookName) {
                webhook = hook;
                break;
            }
        }
    if (!webhook) {
        const sheetData = await smartClient.sheets.getSheet({id : targetSheetId});
        const subColumnIds = await getWebhookColumnId(sheetData);
        const subScopeOption = {
            columnIds: subColumnIds
        };
        //Create New Webhook.
        const createOptions = {
            body: {
                name: hookName,
                callbackUrl : process.env.smartSheetCallBackUrl,
                scope: "sheet",
                scopeObjectId: targetSheetId,
                events: ["*.*"],
                version: 1,
                subscope: subScopeOption
            }
        };
        const createResponse = await smartClient.webhooks.createWebhook(createOptions);
        webhook = createResponse.result;
        console.log(`Created new hook: ${webhook.id}`);
    }
    // Make sure webhook is enabled and pointing to our current url
    const updateOptions = {
        webhookId: webhook.id,
        callbackUrl: process.env.smartSheetCallBackUrl,
        body: { enabled: true }
    };
    const updateResponse = await smartClient.webhooks.updateWebhook(updateOptions);
    const updatedWebhook = updateResponse.result;
    console.log(`Hook enabled: ${updatedWebhook.enabled}, status: ${updatedWebhook.status}`);
}
/* It will take Two Dates and Return delay days*/
export async function getDelayDays(endDate, startDate){
    const oneDay = 1000 * 60 * 60 * 24;
    const diffInTime = endDate.getTime() - startDate.getTime();
    return Math.round(diffInTime / oneDay);
}

export async function getHandoverData(row, DateColumnId){
    let cellValue;
    row.cells.forEach((cell) => {
        if(cell.columnId === DateColumnId && cell.value){
            cellValue = cell.value;
        }
    });
    return cellValue;
}

export async function getForeCastDate(row,forecastedFnishDateColumnId,originalEndDateColumnId){
    let cellValue;
    row.cells.forEach((cell) => {
        if(cell.columnId === forecastedFnishDateColumnId && cell.value){
            cellValue = cell.value;
        }
        if(cell.columnId === originalEndDateColumnId && !cellValue && cell.value){
            cellValue = cell.value;
        }
    });
    return cellValue;
}
export async function getHandoverColumnId(smartSheetData){
    let originalEndDateColumnId, actualStartDateColumnId, forecastedFnishDateColumnId;
    smartSheetData.columns.forEach((column) => {

        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ORIGINAL_PLANNED_FINISH_DATE) {
          originalEndDateColumnId = column.id;
        }
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ACTUAL_START) {
          actualStartDateColumnId = column.id;
        }
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.CURRENT_FORECAST_FINISH) {
          forecastedFnishDateColumnId = column.id;
        }
    });
    return {"originalEndDateColumnId" : originalEndDateColumnId,"actualStartDateColumnId" : actualStartDateColumnId, "forecastedFnishDateColumnId" : forecastedFnishDateColumnId};
}
export async function getRevisedHandoverDate(smartSheetData, actualStartDateColumnId, handoverDate){
    var row,cell;
    for (row of smartSheetData.rows){
        for (cell of row.cells) {
            if (cell.displayValue && (cell.displayValue.toLowerCase().trim() === SmartSheetCellValueEnum.REVISED_HANDOVER_DATE) && !handoverDate) {
                handoverDate = await getHandoverData(row, actualStartDateColumnId);
            }
        }
    }
    return handoverDate;
}
export async function getActualHandoverDate(smartSheetData, actualStartDateColumnId,handoverDate){
    var row,cell;
    for (row of smartSheetData.rows){
        for (cell of row.cells) {
            if (cell.displayValue && (cell.displayValue.toLowerCase().trim() === SmartSheetCellValueEnum.HANDOVER_DATE) && !handoverDate) {
                handoverDate = await getHandoverData(row, actualStartDateColumnId);
            }
        }
    }
    return handoverDate;
}
export async function getForecastedHandoverDate(smartSheetData, forecastedFnishDateColumnId, originalEndDateColumnId, handoverDate){
    var row,cell;
    for (row of smartSheetData.rows){
        for (cell of row.cells) {
            if (cell.displayValue && (cell.displayValue.toLowerCase().trim() === SmartSheetCellValueEnum.HANDOVER) && !handoverDate) {
                const handoverForecast = await getForeCastDate(row, forecastedFnishDateColumnId, originalEndDateColumnId);
                handoverDate = handoverForecast;
            }
        }
    }
    return handoverDate;
}
export async function getReadyHandoverDate(smartSheetData, forecastedFnishDateColumnId, handoverDate){
    var row,cell;
    for (row of smartSheetData.rows){
        for (cell of row.cells) {
            if (cell.displayValue && (cell.displayValue.toLowerCase().trim() === SmartSheetCellValueEnum.READY_FOR_HANDOVER) && !handoverDate) {
                const readyHandover = await getHandoverData(row,forecastedFnishDateColumnId);
                handoverDate = readyHandover;
            }
        }
    }
    return handoverDate;
}
export async function getTaskNameColumnId(sheetData){
    let taskNameColumnId;
    sheetData.columns.forEach((column) => {
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.TASK_NAME ) {
            taskNameColumnId = column.id;
        }
    });
    return taskNameColumnId;
}
export async function getWebhookColumnId(sheetData){
    let summaryDetails, actualFinishDate;
    const columnIds = [];
    sheetData.columns.forEach((column) => {
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.SUMMARY_DETAILS ) {
            summaryDetails = column.id;
            columnIds.push(summaryDetails);
        }
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.ACTUAL_FINISH) {
            actualFinishDate = column.id;
            columnIds.push(actualFinishDate);
        }
    });
    return columnIds;
}
export async function getSummaryDetailsColumnId(sheetData){
    let summaryDetails ;
    sheetData.columns.forEach((column) => {
        const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
        if (columnTitle && columnTitle === SmartSheetColumnNameEnum.SUMMARY_DETAILS ) {
            summaryDetails = column.id;
        }
    });
    return summaryDetails;
}
