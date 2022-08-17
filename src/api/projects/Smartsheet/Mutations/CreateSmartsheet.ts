import {
  getSmartSheetClient,
  createSheet,
  updateSheet,
  getCellData,
  getHandoverDate,
  createWebHook,
} from "../SmartSheetServices";
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
import { prisma } from "../../../../prismaConfig";
export const createSmartSheet = async (root, args, context) => {
  let CreateSheetResponse;
  try {
    const validationResponse = await validateCreateSheetData(args);
    if (validationResponse) {
      return validationResponse;
    }
    const sheetName = `${args.clientName}_${args.clientId}`;
    const smartClient = await getSmartSheetClient();
    const sheetId = await createSheet(smartClient, sheetName);
    const sheetData = await smartClient.sheets.getSheet({ id: sheetId });
    //Update Initial details in SmartSheet.
    const rowArray = await getUpdateSheetData(sheetData, args);
    await updateSheet(smartClient, rowArray, sheetId);
    //Update HandoverDate and sheetId in project table.
    const handoverDate = await getHandoverDate(sheetData);
    await prisma.dc_projects.update({
      data: {
        expectedhandoverdate: handoverDate,
        smartsheetid: sheetId.toString(),
      },
      where: { id: args.projectId },
    });
    await createWebHook(sheetId, sheetName);
    CreateSheetResponse = { code: 200, message: "success", sheetId: sheetId };
    return CreateSheetResponse;
  } catch (error) {
    CreateSheetResponse = { code: 400, message: error.message };
    return CreateSheetResponse;
  }
};
const validateCreateSheetData = async (args) => {
  var CreateResponse;
  if (!args.clientName) {
    CreateResponse = { code: 400, message: "Please Enter Valid ClientName" };
  }
  if (!args.clientId) {
    CreateResponse = { code: 400, message: "Please Enter Valid ClientId" };
  }
  if (!args.designerName) {
    CreateResponse = { code: 400, message: "Please Enter Valid Designer Name" };
  }
  if (!args.designStudio) {
    CreateResponse = { code: 400, message: "Please Enter Valid Design Studio" };
  }
  if (args.clientEmail) {
    const emailReg =
      /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (!emailReg.test(args.clientEmail)) {
      CreateResponse = {
        code: 400,
        message: "Please Enter Valid Client Email",
      };
    }
  }
  if (!args.clientContact) {
    CreateResponse = {
      code: 400,
      message: "Please Enter Valid Client Contact",
    };
  }
  if (!args.propertyAddress) {
    CreateResponse = {
      code: 400,
      message: "Please Enter Valid Property Address",
    };
  }
  if (!args.status) {
    CreateResponse = { code: 400, message: "Please Enter Valid Status" };
  }
  return CreateResponse;
};
const getUpdateSheetData = async (sheetData, args) => {
  const {
    clientName,
    clientId,
    projectSignupValue,
    designerName,
    designStudio,
    salesOwner,
    clientEmail,
    clientContact,
    propertyName,
    propertyAddress,
    status,
  } = args;
  const rowArray = [];
  const columnIds = await getColumnId(sheetData);
  for (var row of sheetData.rows) {
    for (var cell of row.cells) {
      const cellValue = cell.displayValue
        ? cell.displayValue.toLowerCase().trim()
        : null;
      if (cellValue === SmartSheetCellValueEnum.CLIENT_NAME) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            clientName
          )
        );
      } else if (cellValue === SmartSheetCellValueEnum.CLIENT_ID) {
        rowArray.push(
          await getCellData(row.id, columnIds.summaryDetailsColumnId, clientId)
        );
      } else if (cellValue === SmartSheetCellValueEnum.PROJECT_SIGNUP_VALUE) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            projectSignupValue
          )
        );
      } else if (cellValue === SmartSheetCellValueEnum.DESIGNER_NAME) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            designerName
          )
        );
      } else if (cellValue === SmartSheetCellValueEnum.DESIGN_STUDIO) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            designStudio
          )
        );
      } else if (
        cellValue === SmartSheetCellValueEnum.SALES_OWNER &&
        salesOwner
      ) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            salesOwner
          )
        );
      } else if (
        cellValue === SmartSheetCellValueEnum.CLIENT_EMAIL &&
        clientEmail
      ) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            clientEmail
          )
        );
      } else if (cellValue === SmartSheetCellValueEnum.CLIENT_CONTACT) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            clientContact
          )
        );
      } else if (
        cellValue === SmartSheetCellValueEnum.PROPERTY_NAME &&
        propertyName
      ) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            propertyName
          )
        );
      } else if (cellValue === SmartSheetCellValueEnum.PROPERTY_ADDRESS) {
        rowArray.push(
          await getCellData(
            row.id,
            columnIds.summaryDetailsColumnId,
            propertyAddress
          )
        );
      } else if (cellValue === SmartSheetCellValueEnum.STATUS) {
        rowArray.push(
          await getCellData(row.id, columnIds.summaryDetailsColumnId, status)
        );
      }
    }
  }
  return rowArray;
};
const getColumnId = async (sheetData) => {
  let summaryDetailsColumnId,
    actualStartId,
    actualFinishId,
    originalPlannedStartId;
  sheetData.columns.forEach((column) => {
    const columnTitle = column.title ? column.title.toLowerCase().trim() : null;

    if (
      columnTitle &&
      columnTitle === SmartSheetColumnNameEnum.SUMMARY_DETAILS
    ) {
      summaryDetailsColumnId = column.id;
    } else if (
      columnTitle &&
      columnTitle === SmartSheetColumnNameEnum.ACTUAL_START
    ) {
      actualStartId = column.id;
    } else if (
      columnTitle &&
      columnTitle === SmartSheetColumnNameEnum.ACTUAL_FINISH
    ) {
      actualFinishId = column.id;
    } else if (
      columnTitle &&
      columnTitle === SmartSheetColumnNameEnum.ORIGINAL_PLANNED_START_DATE
    ) {
      originalPlannedStartId = column.id;
    }
  });
  return {
    summaryDetailsColumnId: summaryDetailsColumnId,
    actualStartId: actualStartId,
    actualFinishId: actualFinishId,
    originalPlannedStartId: originalPlannedStartId,
  };
};
