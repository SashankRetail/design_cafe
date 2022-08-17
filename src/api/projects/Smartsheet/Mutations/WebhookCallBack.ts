import {getSmartSheetClient, getProjectBySheetId, getSummaryDetailsColumnId, getTaskNameColumnId } from "../SmartSheetServices";
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
import ProjectMileStoneEnum from "../../../../domain/enumerations/ProjectMileStoneEnum";
import { prisma } from "../../../../prismaConfig";
import superagent from "superagent";
import dayjs from "dayjs";
export const webHookCallBack = async (root, args, context) => {
  try {
    const body = args.body;
    console.log(body);
    // Callback could be due to validation, status change, or actual sheet change events
    if (body.challenge) {
      console.log("Received verification callback");
      return {
        status: 200,
        smartsheetHookResponse: body.challenge,
      };
    } else if (body.events) {
      return processEventData(body);
    } else if (body.newWebHookStatus) {
      return {
        sendStatus: 200,
      };
    } else {
      console.log(`Received unknown callback: ${body}`);
      return {
        sendStatus: 200,
      };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const processEventData = async (callbackData) => {
  let sheetResponse;
  try {
    if (callbackData.scope !== "sheet") {
      return { code: 400, message: "Wrong Event" };
    }
    for (const event of callbackData.events) {
      await updateProjectData(event, callbackData);
    }
    sheetResponse = { code: 200, message: "success" };
    return sheetResponse;
  } catch (error) {
    sheetResponse = { code: 400, message: error.message };
    return sheetResponse;
  }
};
const updateProjectData = async (event, callbackData) => {
  if (event.objectType === "cell") {
    const eventColumnId = event.columnId.toString();
    var options = {
      sheetId: callbackData.scopeObjectId,
      rowId: event.rowId.toString(),
    };
    const smartClient = await getSmartSheetClient();
    const row = await smartClient.sheets.getRow(options);
    const project = await getProjectBySheetId(
      callbackData.scopeObjectId.toString()
    );
    for (var cell of row.cells) {
      const cellValue = await getCellValue(cell);
      if (cellValue === SmartSheetCellValueEnum.REVISED_HANDOVER_DATE) {
        await UpdateHandoverDate(project, row, eventColumnId);
      } else if (cellValue === SmartSheetCellValueEnum.PROJECT_MANAGER) {
        await updatePM(project, row, eventColumnId);
      } else if (cellValue === SmartSheetCellValueEnum.HANDOVER) {
        await deleteWebHook(row, event, callbackData, smartClient);
      }
    }
    await updateCurrentMileStone(eventColumnId, event.rowId.toString(), callbackData.scopeObjectId, smartClient);
    var columnOption = {
      sheetId: callbackData.scopeObjectId,
      columnId: eventColumnId,
    };
    const column = await smartClient.sheets.getColumns(columnOption);
    if (
      column.title.toLowerCase().trim() ===
      SmartSheetColumnNameEnum.ACTUAL_FINISH
    ) {
      await prisma.dc_projects.update({
        data: { lastupdatedate: new Date() },
        where: { id: project.id },
      });
    }
  }
};
const updateCurrentMileStone = async (eventColumnId, eventRowId, smartSheetId, smartClient) => {
  let updatedMileStone;
  var columnOption = {
    sheetId: smartSheetId,
    columnId: eventColumnId,
  };
  const column = await smartClient.sheets.getColumns(columnOption);
  if (column.title.toLowerCase().trim() === SmartSheetColumnNameEnum.ACTUAL_FINISH) {
    var options = {
      sheetId: smartSheetId,
      rowId: eventRowId,
    };
    const row = await smartClient.sheets.getRow(options);
    for (var cell of row.cells) {
      if (cell.columnId.toString() === eventColumnId.toString() && cell.value) {
        updatedMileStone = await getUpdatedMileStone(row);
      }
    }
    if (updatedMileStone && updatedMileStone.mileStoneName) {
      let milestoneName = updatedMileStone.mileStoneName;
      const project = await getProjectBySheetId(smartSheetId.toString());
      if(!updatedMileStone.isSheet){
        const mileStones = await getCurrentMileStone(updatedMileStone.mileStoneName, project.milestones);
        const currentMileStone = mileStones.currentMileStone;
        milestoneName = mileStones.oldMileStone;
        await prisma.dc_projects.update({
          data: { currentmilestone: currentMileStone },
          where: { id: project.id },
        });
      }
      const webEngageResponse = await postWebEngageApi(milestoneName, smartSheetId, smartClient, project);
      console.log(webEngageResponse);
    }
  }
};
const getUpdatedMileStone = async (row) => {
  let updatedMileStone;
  let responseObj;
  for (var cell of row.cells) {
    const cellValue = await getCellValue(cell);
    if (!updatedMileStone && cellValue) {
      responseObj = await getMileStone(cellValue);
      updatedMileStone = responseObj.mileStoneName;
    }
  }
  return responseObj;
};
const getCurrentMileStone = async (updatedMileStone, milestones) => {
  var i, currentMileStone, oldMileStone;
  const mileStoneName = updatedMileStone.toLowerCase().trim();
  milestones = milestones.attributes.milestone_details;
  for (i = 0; i < milestones.length; i++) {
    if (milestones[i].label.toLowerCase().trim() === mileStoneName) {
      if (mileStoneName === ProjectMileStoneEnum.HANDOVER) {
        currentMileStone = milestones[i].label.trim();
        oldMileStone = milestones[i].label.trim();
      } else {
        currentMileStone = milestones[i + 1].label.trim();
        oldMileStone = milestones[i].label.trim();
      }
    }
  }
  return {"currentMileStone" : currentMileStone,"oldMileStone" : oldMileStone};
};
const getMileStone = async (cellValue) => {
  let mileStoneName;
  let isSheet = false;
  switch (cellValue) {
    case SmartSheetCellValueEnum.PROJECT_SIGNUP: {
      mileStoneName = ProjectMileStoneEnum.PROJECT_SIGNUP;
      break;
    }
    case SmartSheetCellValueEnum.SITE_SURVEY: {
      mileStoneName = ProjectMileStoneEnum.SITE_SURVEY;
      break;
    }
    case SmartSheetCellValueEnum.SITE_SURVEY_COMPLETE: {
      mileStoneName = ProjectMileStoneEnum.SITE_SURVEY;
      break;
    }
    case SmartSheetCellValueEnum.KNOW_YOUR_CLIENT: {
      mileStoneName = ProjectMileStoneEnum.KNOW_YOUR_CLIENT;
      break;
    }
    case SmartSheetCellValueEnum.FIRST_CUT_MEETING: {
      mileStoneName = ProjectMileStoneEnum.DESIGN_PRESENTATION;
      break;
    }
    case SmartSheetCellValueEnum.DESIGN_PRESENTATION: {
      mileStoneName = ProjectMileStoneEnum.DESIGN_PRESENTATION;
      break;
    }
    case SmartSheetCellValueEnum.DESIGN_FINALIZATION: {
      mileStoneName = ProjectMileStoneEnum.DESIGN_FINALIZATION;
      break;
    }
    case SmartSheetCellValueEnum.REQUEST_PM_FOR_KICKOFF: {
      mileStoneName = ProjectMileStoneEnum.SITE_VALIDATION_REQUEST;
      break;
    }
    case SmartSheetCellValueEnum.KICKOFF_MEETING_AT_SITE: {
      mileStoneName = ProjectMileStoneEnum.SITE_VALIDATION_MEETING;
      break;
    }
    case SmartSheetCellValueEnum.DWG_REVISIONS: {
      mileStoneName = ProjectMileStoneEnum.POST_SITE_VALIDATION_REVISION;
      break;
    }
    case SmartSheetCellValueEnum.GFC_CHECKING: {
      mileStoneName = ProjectMileStoneEnum.GFC_CHECKING;
      break;
    }
    case SmartSheetCellValueEnum.DESIGN_SIGN_OFF: {
      mileStoneName = ProjectMileStoneEnum.DESIGN_SIGNOFF;
      break;
    }
    case SmartSheetCellValueEnum.DESIGN_SIGN_OFF_PRESENTATION: {
      mileStoneName = ProjectMileStoneEnum.DESIGN_SIGNOFF;
      break;
    }
    case SmartSheetCellValueEnum.PROJECT_RECEIVED_FOR_PLANNING: {
      mileStoneName = ProjectMileStoneEnum.PRODUCTION_REQUEST;
      break;
    }
    case SmartSheetCellValueEnum.PRODUCTION: {
      mileStoneName = ProjectMileStoneEnum.PRODUCTION;
      break;
    }
    case SmartSheetCellValueEnum.READY_FOR_DISPATCH: {
      mileStoneName = ProjectMileStoneEnum.READY_FOR_DISPATCH;
      break;
    }
    case SmartSheetCellValueEnum.PENDING_HARDWARE_QC: {
      mileStoneName = ProjectMileStoneEnum.READY_FOR_DISPATCH;
      break;
    }
    case SmartSheetCellValueEnum.READY_FOR_HANDOVER: {
      mileStoneName = ProjectMileStoneEnum.READY_FOR_HANDOVER;
      break;
    }
    case SmartSheetCellValueEnum.HANDOVER: {
      mileStoneName = ProjectMileStoneEnum.HANDOVER;
      break;
    }
    case SmartSheetCellValueEnum.THIRTYFIVE_PAYMENT_CONFIRMATION: {
      mileStoneName = ProjectMileStoneEnum.THIRTYFIVE_PAYMENT;
      isSheet = true;
      break;
    }
    case SmartSheetCellValueEnum.DESIGN_ITERATION: {
      mileStoneName = ProjectMileStoneEnum.DESIGN_ITERATION;
      isSheet = true;
      break;
    }
    case SmartSheetCellValueEnum.MATERIAL_SELECTION: {
      mileStoneName = ProjectMileStoneEnum.MATERIAL_SELECTION;
      isSheet = true;
      break;
    }
    case SmartSheetCellValueEnum.FOURTYFIVE_PAYMENT_CONFIRMATION: {
      mileStoneName = ProjectMileStoneEnum.FOURTYFIVE_PAYMENT_CONFIRMATION;
      isSheet = true;
      break;
    }
    case SmartSheetCellValueEnum.FIFTEEN_PAYMENT_CONFIRMATION: {
      mileStoneName = ProjectMileStoneEnum.FIFTEEN_PAYMENT_CONFIRMATION;
      isSheet = true;
      break;
    }
    default: {
      break;
    }
  }
  return {"mileStoneName":mileStoneName,"isSheet":isSheet};
};
const getCellValue = async (cell) => {
  return cell.displayValue ? cell.displayValue.toLowerCase().trim() : null;
};
const UpdateHandoverDate = async (project, row, eventColumnId) => {
  let handoverDate;
  for (var cell of row.cells) {
    if (cell.columnId.toString() === eventColumnId.toString()) {
      handoverDate = cell.value;
      if (handoverDate) {
        await prisma.dc_projects.update({
          data: { expectedhandoverdate: new Date(handoverDate) },
          where: { id: project.id },
        });
      }
    }
  }
};
const deleteWebHook = async (row, event, callbackData, smartClient) => {
  var options = {
    sheetId: callbackData.scopeObjectId,
    columnId: event.columnId.toString(),
  };
  const column = await smartClient.sheets.getColumns(options);
  if (
    column.title.toLowerCase().trim() === SmartSheetColumnNameEnum.ACTUAL_FINISH
  ) {
    for (var cell of row.cells) {
      if (cell.columnId.toString() === event.columnId.toString()) {
        if (cell.value) {
          var deleteHook = {
            webhookId: callbackData.webhookId,
          };
          await smartClient.webhooks.deleteWebhook(deleteHook);
        }
      }
    }
  }
};
const updatePM = async (project, row, eventColumnId) => {
  let projectManager;
  for (var cell of row.cells) {
    if (cell.columnId.toString() === eventColumnId.toString()) {
      projectManager = cell.value;
      if (projectManager) {
        await prisma.dc_projects.update({
          data: { projectmanagername: projectManager },
          where: { id: project.id },
        });
      }
    }
  }
};
const postWebEngageApi = async (updatedMileStone, smartSheetId, smartClient, project) => {
  const sheetData = await smartClient.sheets.getSheet({ id: smartSheetId });
  const taskNameColumnId = await getTaskNameColumnId(sheetData);
  const summaryDetailsColumnId = await getSummaryDetailsColumnId(sheetData);
  let clientEmail, clientContact, designerName;
  for (var row of sheetData.rows) {
    for (var cell of row.cells) {
      const cellValue = await getCellValue(cell);
        if (cell.columnId === taskNameColumnId && cellValue === SmartSheetCellValueEnum.DESIGNER_NAME) {
          designerName = await getDesignerName(row, summaryDetailsColumnId);
        }
        if (cell.columnId === taskNameColumnId && cellValue === SmartSheetCellValueEnum.CLIENT_EMAIL) {
          clientEmail = await getClientContact(row, summaryDetailsColumnId);
        }
        if (cell.columnId === taskNameColumnId && cellValue === SmartSheetCellValueEnum.CLIENT_CONTACT) {
          clientContact = await getClientEmail(row, summaryDetailsColumnId);
        }
    }
  }
  return callWebEngageApi(clientContact, updatedMileStone, designerName, clientEmail, project);
};
const callWebEngageApi = async (clientContact, updatedMileStone, designerName, clientEmail, project) => {
  if(process.env.WebEngageEnv !== "prod"){
    clientContact = process.env.TestPhone;
  }
  if(updatedMileStone === "Post Site Validation Revision"){
    updatedMileStone = "Dwg Revisions Completed";
  }
  if(updatedMileStone === "Design Sign-Off"){
    updatedMileStone = "Design Sign Off";
  }
  const completionDate = dayjs(project.expectedhandoverdate).format("DD MMMM YYYY");
  const attributeModel = {"milestoneName": updatedMileStone, "DesignerName" : designerName,"IsImosProject":project.isimosproject, "completionDate":completionDate};
  const requestBody = {"userId" : clientContact, "email" : clientEmail, "phone" : clientContact, "attributes":attributeModel};
  console.log(requestBody);
  const url = process.env.WebEngageUrl;
  const webEngagePushDataResponse = await superagent
      .put(url)
      .send(requestBody)
      .set("Content-Type", "application/json")
      .set("Authorization",process.env.WebEngageAuthorizationToken)
  if(JSON.stringify(webEngagePushDataResponse.body.response.status === "queued")){
    return {
      code: 200,
      message : "Data Successfully pushed to WebEngage"
    }
  }else{
    return {
      code: 400,
      response:JSON.stringify(webEngagePushDataResponse)
    }
  }
};
const getDesignerName = async (row, summaryDetailsColumnId) => {
  let designerName;
  for (var cell of row.cells) {
    if(cell.columnId.toString() === summaryDetailsColumnId.toString()){
      designerName = cell.value;
        break;
    }
  }
  return designerName;
};
const getClientContact = async (row, summaryDetailsColumnId) => {
  let clientContact;
  for (var cell of row.cells) {
    if(cell.columnId.toString() === summaryDetailsColumnId.toString()){
      clientContact = cell.value;
        break;
    }
  }
  return clientContact;
};
const getClientEmail = async (row, summaryDetailsColumnId) => {
  let clientEmail;
  for (var cell of row.cells) {
    if(cell.columnId.toString() === summaryDetailsColumnId.toString()){
      clientEmail = cell.value;
        break;
    }
  }
  return clientEmail;
};
