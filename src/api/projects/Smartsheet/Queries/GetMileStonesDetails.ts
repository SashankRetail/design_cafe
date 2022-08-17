import {
  getSmartSheetClient,
  getProjectBySheetId,
  getHandoverDate,
  getDelayDays,
  getTaskNameColumnId,
} from "../SmartSheetServices";
import SmartSheetColumnNameEnum from "../../../../domain/enumerations/SmartSheetColumnNameEnum";
import SmartSheetCellValueEnum from "../../../../domain/enumerations/SmartSheetCellValueEnum";
import ProjectMileStoneEnum from "../../../../domain/enumerations/ProjectMileStoneEnum";
import { prisma } from "../../../../prismaConfig";
export const getMileStoneDetails = async (root, args, context) => {
  let GetMileStoneResponse;
  var handoverDate;
  try {
    if (!args.sheetId) {
      return { code: 400, message: "Please Enter Valid Smartsheet Id" };
    }
    const smartClient = await getSmartSheetClient();
    const sheetData = await smartClient.sheets.getSheet({ id: args.sheetId });
    const project = await getProjectBySheetId(args.sheetId);
    const mileStoneData = await getMileStoneData(
      sheetData,
      project.milestones,
      ""
    );
    handoverDate = await getHandoverDate(sheetData);
    if (handoverDate) {
      handoverDate = new Date(handoverDate);
    }
    //update HandoverDate into DB project table.
    await prisma.dc_projects.update({
      data: { expectedhandoverdate: handoverDate },
      where: { id: project.id },
    });
    GetMileStoneResponse = {
      code: 200,
      message: "success",
      data: mileStoneData,
    };
    return GetMileStoneResponse;
  } catch (error) {
    GetMileStoneResponse = { code: 400, message: error.message };
    return GetMileStoneResponse;
  }
};
export const getMileStoneData = async (sheetData, mileStones, type) => {
  const columnJson = await getColumnIds(sheetData);
  var mileStone, checkListdata;
  const milestonelist = [],
    listType = type;
  const taskNameColumnId = await getTaskNameColumnId(sheetData);
  for (var row of sheetData.rows) {
    for (var cell of row.cells) {
      const cellValue = cell.displayValue
        ? cell.displayValue.toLowerCase().trim()
        : null;
      if (cell.columnId === taskNameColumnId) {
        if (cellValue && cellValue === SmartSheetCellValueEnum.PROJECT_SIGNUP) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.PROJECT_SIGNUP) {
              const projectSignUpData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getChecklistData(
                milestoneChecklist,
                lableName,
                projectSignUpData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = projectSignUpData;
            }
          }
        }
        if (cellValue && (cellValue === SmartSheetCellValueEnum.SITE_SURVEY ||
          cellValue === SmartSheetCellValueEnum.SITE_SURVEY_COMPLETE)) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.SITE_SURVEY) {
              const siteSurveyData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getSiteSurveyData(
                milestoneChecklist,
                lableName,
                siteSurveyData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = siteSurveyData;
            }
          }
        }
        if (
          cellValue &&
          cellValue === SmartSheetCellValueEnum.KNOW_YOUR_CLIENT
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.KNOW_YOUR_CLIENT) {
              const kycData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getKYCData(
                milestoneChecklist,
                lableName,
                kycData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = kycData;
            }
          }
        }
        if (
          cellValue &&
          (cellValue === SmartSheetCellValueEnum.FIRST_CUT_MEETING ||
            cellValue === SmartSheetCellValueEnum.DESIGN_PRESENTATION)
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.DESIGN_PRESENTATION) {
              const designPresentationData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getDesignpresentationData(
                milestoneChecklist,
                lableName,
                designPresentationData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = designPresentationData;
            }
          }
        }
        if (
          cellValue &&
          cellValue === SmartSheetCellValueEnum.DESIGN_FINALIZATION
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.DESIGN_FINALIZATION) {
              const designFinalizationData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getDesignfinalizationData(
                milestoneChecklist,
                lableName,
                designFinalizationData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = designFinalizationData;
            }
          }
        }
        if (
          cellValue &&
          cellValue === SmartSheetCellValueEnum.REQUEST_PM_FOR_KICKOFF
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.SITE_VALIDATION_REQUEST) {
              const pmKickOffData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getSiterequestData(
                milestoneChecklist,
                lableName,
                pmKickOffData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = pmKickOffData;
            }
          }
        }
        if (
          cellValue &&
          cellValue === SmartSheetCellValueEnum.KICKOFF_MEETING_AT_SITE
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.SITE_VALIDATION_MEETING) {
              const meetingatSiteData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getSitemeetingData(
                milestoneChecklist,
                lableName,
                meetingatSiteData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = meetingatSiteData;
            }
          }
        }
        if (cellValue && cellValue === SmartSheetCellValueEnum.DWG_REVISIONS) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (
              lableName === ProjectMileStoneEnum.POST_SITE_VALIDATION_REVISION
            ) {
              const dwgRevisionData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getPostSiteData(
                milestoneChecklist,
                lableName,
                dwgRevisionData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = dwgRevisionData;
            }
          }
        }
        if (cellValue && cellValue === SmartSheetCellValueEnum.GFC_CHECKING) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.GFC_CHECKING) {
              const gfcChekingData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getGFCData(
                milestoneChecklist,
                lableName,
                gfcChekingData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = gfcChekingData;
            }
          }
        }
        if (
          cellValue &&
          (cellValue === SmartSheetCellValueEnum.DESIGN_SIGN_OFF ||
            cellValue === SmartSheetCellValueEnum.DESIGN_SIGN_OFF_PRESENTATION)
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.DESIGN_SIGNOFF) {
              const designSignOffData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getDesignSignoffData(
                milestoneChecklist,
                lableName,
                designSignOffData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = designSignOffData;
            }
          }
        }
        if (
          cellValue &&
          cellValue === SmartSheetCellValueEnum.PROJECT_RECEIVED_FOR_PLANNING
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.PRODUCTION_REQUEST) {
              const receivedForPlanningData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getProductionRequestData(
                milestoneChecklist,
                lableName,
                receivedForPlanningData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = receivedForPlanningData;
            }
          }
        }
        if (
          cellValue &&
          cellValue === SmartSheetCellValueEnum.THIRTYFIVE_PAYMENT_CONFIRMATION
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.THIRTYFIVE_PAYMENT) {
              const thirtyFiveData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await get35Data(
                milestoneChecklist,
                lableName,
                thirtyFiveData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = thirtyFiveData;
            }
          }
        }
        if (cellValue && cellValue === SmartSheetCellValueEnum.PRODUCTION) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.PRODUCTION) {
              const productionData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getProductionData(
                milestoneChecklist,
                lableName,
                productionData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = productionData;
            }
          }
        }
        if (
          cellValue &&
          (cellValue === SmartSheetCellValueEnum.READY_FOR_DISPATCH ||
            cellValue === SmartSheetCellValueEnum.PENDING_HARDWARE_QC)
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.READY_FOR_DISPATCH) {
              const readyDispatchData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getReadyDispatchData(
                milestoneChecklist,
                lableName,
                readyDispatchData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = readyDispatchData;
            }
          }
        }
        if (
          cellValue &&
          cellValue === SmartSheetCellValueEnum.READY_FOR_HANDOVER
        ) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.READY_FOR_HANDOVER) {
              const readyHandoverData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getReadyHandoverData(
                milestoneChecklist,
                lableName,
                readyHandoverData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = readyHandoverData;
            }
          }
        }
        if (cellValue && cellValue === SmartSheetCellValueEnum.HANDOVER) {
          for (mileStone of mileStones.attributes.milestone_details) {
            const lableName = mileStone.label
              ? mileStone.label.toLowerCase().trim()
              : null;
            if (lableName === ProjectMileStoneEnum.HANDOVER) {
              const handoverData = await getmileStoneCellData(
                row,
                columnJson,
                listType
              );
              const milestoneChecklist = mileStone.milestone_checklist;
              checkListdata = await getHandoverData(
                milestoneChecklist,
                lableName,
                handoverData
              );
              milestonelist.push(checkListdata);
              mileStone.MileStoneData = handoverData;
            }
          }
        }
      }
    }
  }
  if (type === "home") {
    return milestonelist;
  } else {
    return mileStones;
  }
};
const getmileStoneCellData = async (row, columnJson, listType) => {
  let assignedTo,
    originalStartDate,
    originalEndDate,
    actualStartDate,
    actualEndDate,
    forecastedEndDate,
    forecastedStartDate,
    taskStatus;
  let delayDays;
  let delayStatus = "onTime";
  row.cells.forEach((cell) => {
    switch (cell.columnId) {
      case columnJson.assignedToColumnId: {
        assignedTo = cell.value;
        break;
      }
      case columnJson.originalStartDateColumnId: {
        originalStartDate = cell.value;
        break;
      }
      case columnJson.originalEndDateColumnId: {
        originalEndDate = cell.value;
        break;
      }
      case columnJson.actualStartDateColumnId: {
        actualStartDate = cell.value;
        break;
      }
      case columnJson.actualEndDateColumnId: {
        actualEndDate = cell.value;
        break;
      }
      case columnJson.forecastedEndDateColumnId: {
        forecastedEndDate = cell.value;
        break;
      }
      case columnJson.forecastedStartDateColumnId: {
        forecastedStartDate = cell.value;
        break;
      }
      case columnJson.taskStatusColumnId: {
        taskStatus = cell.value;
        break;
      }
      default:
        break;
    }
  });
  switch (taskStatus) {
    case "Complete": {
      delayDays = await getDelayDays(
        new Date(actualEndDate),
        new Date(originalEndDate)
      );
      break;
    }
    case "Not Started": {
      delayDays = await getDelayDays(
        new Date(forecastedEndDate),
        new Date(originalEndDate)
      );
      break;
    }
    case "In Progress": {
      delayDays = await getDelayDays(
        new Date(forecastedEndDate),
        new Date(originalEndDate)
      );
      break;
    }
    default:
      break;
  }
  if (delayDays > 0) {
    delayStatus = "delayed";
  } else {
    delayDays = 0;
  }
  if (listType === "home") {
    return {
      forecastedEndDate: forecastedEndDate,
      taskStatus: taskStatus,
      delayDays: delayDays,
      delayStatus: delayStatus,
    };
  } else {
    return {
      assignedTo: assignedTo,
      originalStartDate: originalStartDate,
      originalEndDate: originalEndDate,
      actualStartDate: actualStartDate,
      actualEndDate: actualEndDate,
      forecastedEndDate: forecastedEndDate,
      forecastedStartDate: forecastedStartDate,
      taskStatus: taskStatus,
      delayDays: delayDays,
      delayStatus: delayStatus,
    };
  }
};

const getColumnIds = async (sheetData) => {
  const columnJson = await getColumnsJson();
  sheetData.columns.forEach((column) => {
    const columnTitle = column.title ? column.title.toLowerCase().trim() : null;
    switch (columnTitle) {
      case SmartSheetColumnNameEnum.ASSIGN_TO: {
        columnJson.assignedToColumnId = column.id;
        break;
      }
      case SmartSheetColumnNameEnum.ORIGINAL_PLANNED_START_DATE: {
        columnJson.originalStartDateColumnId = column.id;
        break;
      }
      case SmartSheetColumnNameEnum.ORIGINAL_PLANNED_FINISH_DATE: {
        columnJson.originalEndDateColumnId = column.id;
        break;
      }
      case SmartSheetColumnNameEnum.ACTUAL_START: {
        columnJson.actualStartDateColumnId = column.id;
        break;
      }
      case SmartSheetColumnNameEnum.ACTUAL_FINISH: {
        columnJson.actualEndDateColumnId = column.id;
        break;
      }
      case SmartSheetColumnNameEnum.CURRENT_FORECAST_START: {
        columnJson.forecastedStartDateColumnId = column.id;
        break;
      }
      case SmartSheetColumnNameEnum.CURRENT_FORECAST_FINISH: {
        columnJson.forecastedEndDateColumnId = column.id;
        break;
      }
      case SmartSheetColumnNameEnum.TASK_STATUS: {
        columnJson.taskStatusColumnId = column.id;
        break;
      }
    }
  });
  return columnJson;
};
const getColumnsJson = async () => {
  return {
    assignedToColumnId: null,
    originalStartDateColumnId: null,
    originalEndDateColumnId: null,
    actualStartDateColumnId: null,
    actualEndDateColumnId: null,
    forecastedEndDateColumnId: null,
    forecastedStartDateColumnId: null,
    taskStatusColumnId: null,
  };
};
const getChecklistData = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (val.length !== 0 && lableName === ProjectMileStoneEnum.PROJECT_SIGNUP) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.PROJECT_SIGNUP,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getSiteSurveyData = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (val.length !== 0 && lableName === ProjectMileStoneEnum.SITE_SURVEY) {
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.SITE_SURVEY,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getKYCData = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.KNOW_YOUR_CLIENT
    ) {
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.KNOW_YOUR_CLIENT,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getDesignpresentationData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.DESIGN_PRESENTATION
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.DESIGN_PRESENTATION,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getDesignfinalizationData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.DESIGN_FINALIZATION
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.DESIGN_FINALIZATION,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getSiterequestData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.SITE_VALIDATION_REQUEST
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.SITE_VALIDATION_REQUEST,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getSitemeetingData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.SITE_VALIDATION_MEETING
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.SITE_VALIDATION_MEETING,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getPostSiteData = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.POST_SITE_VALIDATION_REVISION
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.POST_SITE_VALIDATION_REVISION,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getGFCData = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (val.length !== 0 && lableName === ProjectMileStoneEnum.GFC_CHECKING) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.GFC_CHECKING,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getDesignSignoffData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (val.length !== 0 && lableName === ProjectMileStoneEnum.DESIGN_SIGNOFF) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.DESIGN_SIGNOFF,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getProductionRequestData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.PRODUCTION_REQUEST
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.PRODUCTION_REQUEST,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const get35Data = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.THIRTYFIVE_PAYMENT
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.THIRTYFIVE_PAYMENT,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getProductionData = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (val.length !== 0 && lableName === ProjectMileStoneEnum.PRODUCTION) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.PRODUCTION,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getReadyDispatchData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.READY_FOR_DISPATCH
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.READY_FOR_DISPATCH,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getReadyHandoverData = async (
  milestoneChecklist,
  lableName,
  statusData
) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (
      val.length !== 0 &&
      lableName === ProjectMileStoneEnum.READY_FOR_HANDOVER
    ) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.READY_FOR_HANDOVER,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
const getHandoverData = async (milestoneChecklist, lableName, statusData) => {
  let ms = {};
  const checklistName = [];
  milestoneChecklist.forEach((val) => {
    if (val.length !== 0 && lableName === ProjectMileStoneEnum.HANDOVER) {
      //checklistName.push(val["checklist_string"])
      checklistName.push(val);
    }
  });
  ms = {
    name: ProjectMileStoneEnum.HANDOVER,
    checklist_name: checklistName,
    taskStatus: statusData,
  };
  return ms;
};
