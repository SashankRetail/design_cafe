import { prisma } from "../../../prismaConfig";
import {
  getFileChecklistName,
  FileCheckListName,
} from "../../../domain/enumerations/FileCheckListEnums";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import HttpError from "standard-http-error";
import { checkAndMarkMilestonesOnSmartsheet } from "../../../utils/commonUtils";

export const addMilestoneFiles = async (root, args, context) => {
  const {
    projectid,
    filename,
    filekey,
    fileurl,
    contenttype,
    uploadedby,
    comments,
  } = args;
  try {
    await authenticate(context, "DD");
    let selectedMilestone;
    const fileCheckListName = await validateAndGetChecklistName(filename);

    const project = await prisma.dc_projects.findFirst({
      where: { id: projectid },
    });
    if (!project) {
      throw new HttpError(400, "Project not found");
    }
    let milestonedetails = [],
      milestonechecklist = [],
      fileschecklist = [];

    const milestones = project.milestones;
    milestonedetails = milestones["attributes"].milestone_details;
    milestonedetails.forEach(async (milestone) => {
      milestonechecklist = milestone.milestone_checklist;
      milestonechecklist.forEach(async (fetchedmilestone) => {
        if (
          filename === FileCheckListName.SURVEY_DRAWINGS ||
          filename === FileCheckListName.SITE_IMAGES ||
          filename === FileCheckListName.DESIGN_PRESENTATION
        ) {
          if (
            fetchedmilestone.length !== 0 &&
            fetchedmilestone["checklist_string"] === fileCheckListName
          ) {
            fetchedmilestone.is_checked = true;
            selectedMilestone = milestone;
          }
        }
      });
    });
    fileschecklist = milestones["attributes"].files_checklist;

    fileschecklist.forEach(async (file) => {
      if (file.length !== 0 && file["checklist_string"] === filename) {
        file.filekey = filekey;
        file.fileurl = fileurl;
        file.contentType = contenttype;
        file.uploadedby = uploadedby;
        file.uploadedon = new Date();
        const res = getApprovalStatus(file.approval_from_customer);
        file.approvalstatus = res.status;
        file.sentondate = res.sentOnDate;
        file.created_at = new Date();
        file.updated_at = new Date();
        file.comments = comments;
      }
    });

    await prisma.dc_projects.update({
      data: { milestones: milestones },
      where: { id: projectid },
    });

    if (selectedMilestone) {
      await checkAndMarkMilestonesOnSmartsheet(projectid, selectedMilestone);
    }
    return { code: 200, message: "success" };
  } catch (error) {
    return { code: 400, message: error.message };
  }
};
const validateAndGetChecklistName = async (checklistNameInReq) => {
  return getFileChecklistName(checklistNameInReq);
};
export const getApprovalStatus = (approvalRequiredstatus) => {
  let status, sentOnDate;
  if (approvalRequiredstatus) {
    status = "Pending Approval";
    sentOnDate = new Date();
  } else {
    status = null;
    sentOnDate = null;
  }
  return { status, sentOnDate };
};
