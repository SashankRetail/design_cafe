import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";
import { prisma } from "../../../../prismaConfig";
import httpError from "standard-http-error";
import { checkAndMarkMilestonesOnSmartsheet } from "../../../../utils/commonUtils";

let milestoneObj;
export const acceptDesignSignOffDocs = async (_root, args, _context) => {
  try {
    const customer = await authenticate(_context, "CD");
    const { documentname, status } = args;
    let selectedMilestones;
    const project = await prisma.dc_projects.findFirst({
      where: { customerid: customer.customerid },
    });
    let fileschecklist = [];

    let milestones = project.milestones;
    fileschecklist = milestones["attributes"].files_checklist;
    const filesChecklistValue = documentname;

    //Logic here
    if (
      filesChecklistValue === "Design Presentation" ||
      filesChecklistValue.includes("Design Presentation")
    ) {
      const milestoneObj = markMilestoneChecklist(
        milestones,
        "Customer Approved Designs"
      );
      milestones = milestoneObj.milestones;
      selectedMilestones = milestoneObj.selectedMilestones;
    }

    for (let i = 0; i < fileschecklist.length; i++) {
      if (fileschecklist[i].length !== 0) {
        if (fileschecklist[i]["checklist_string"] === filesChecklistValue) {
          await markFilesApproved(
            project.id,
            milestones,
            fileschecklist,
            filesChecklistValue,
            status
          );
          if (status === 1) {
            const designSignOffMilestone = milestones[
              "attributes"
            ].milestone_details.find(
              (milestoneDetail) => milestoneDetail.label === "Design Sign-Off"
            );
            const customerSignOffChecklist =
              designSignOffMilestone.milestone_checklist.find(
                (checklist) =>
                  checklist.checklist_string === "Request Customer Signoff"
              );
            if (
              customerSignOffChecklist &&
              customerSignOffChecklist.data &&
              customerSignOffChecklist.data.isRequested
            ) {
              milestoneObj = checkAndMarkCustomerSignOff(
                fileschecklist,
                milestones
              );
              milestones = milestoneObj.milestones;
              selectedMilestones = milestoneObj.selectedMilestone;
            }
          }
        }
      }
    }

    await prisma.dc_projects.update({
      data: { milestones: milestones },
      where: { id: project.id },
    });
    if (selectedMilestones) {
      await checkAndMarkMilestonesOnSmartsheet(project.id, selectedMilestones);
    }
    return { code: 200, message: "success" };
  } catch (error) {
    console.log(error.message);
    throw new httpError(500, error);
  }
};

const checkAndMarkCustomerSignOff = (fileschecklist, milestones) => {
  let selectedMilestone;
  let canMarkCustomerSignOff = true;

  fileschecklist.forEach((file) => {
    if (file.approval_from_customer) {
      if (file.approvalstatus && file.fileurl) {
        if (file.approvalstatus !== "Approved") {
          canMarkCustomerSignOff = false;
        }
      }
    }
  });
  if (canMarkCustomerSignOff) {
    milestones["attributes"].milestone_details.forEach((milestoneDetail) => {
      if (milestoneDetail.label === "Design Sign-Off") {
        milestoneDetail.milestone_checklist.forEach((milestoneChecklist) => {
          console.log(milestoneChecklist.checklist_string);
          if (
            milestoneChecklist.checklist_string === "Request Customer Signoff"
          ) {
            milestoneChecklist.data.isRequested = false;
          }
          if (milestoneChecklist.checklist_string === "Customer Signoff ") {
            milestoneChecklist.is_checked = true;
            selectedMilestone = milestoneDetail;
          }
        });
      }
    });
  }
  return { milestones, selectedMilestone };
};

const markFilesApproved = async (
  projectId,
  milestones,
  milestonesFiles,
  filesChecklistValue,
  status
) => {
  milestonesFiles.forEach((file) => {
    if (file.checklist_string === filesChecklistValue) {
      if (status === 1) {
        file.approvalstatus = "Approved";
        file.approvedon = new Date();
        file.updated_at = new Date();
      } else {
        file.approvalstatus = "Rejected";
        file.rejecteddon = new Date();
        file.updated_at = new Date();
      }
    }
  });
  milestones["attributes"].files_checklist = milestonesFiles;

  await prisma.dc_projects.update({
    where: {
      id: projectId,
    },
    data: {
      milestones: milestones,
    },
  });
};

const markMilestoneChecklist = (milestones, filesChecklistValue) => {
  let selectedMilestones;
  milestones["attributes"].milestone_details.forEach((milestone) => {
    if (milestone.milestone_checklist.length > 0) {
      milestone.milestone_checklist.forEach((checklist) => {
        if (checklist.checklist_string === filesChecklistValue) {
          checklist.is_checked = true;
          selectedMilestones = milestone;
        }
      });
    }
  });

  return { selectedMilestones, milestones };
};
