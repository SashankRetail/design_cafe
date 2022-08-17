import { prisma } from "../../../prismaConfig";
import { checkAndMarkMilestonesOnSmartsheet } from "../../../utils/commonUtils";

export const updatePaymentMilestones = async (_root, args, _context) => {
  const { projectId, paymentMilestoneName, projectValue } = args;
  const responseObj = { code: 200, message: "" };
  let selectedMilestone;
  try {
    const getProjectWithProjectId: any = await prisma.dc_projects.findFirst({
      where: {
        id: projectId,
      },
    });

    getProjectWithProjectId.milestones.attributes.milestone_details.forEach(
      (milestone) => {
        milestone.milestone_checklist.forEach((milestoneChecklist) => {
          if (milestoneChecklist.checklist_string === paymentMilestoneName) {
            milestoneChecklist.is_checked = true;
            selectedMilestone = milestone;
          }
        });
      }
    );
    if (paymentMilestoneName === "5% Modular Payment") {
      await prisma.dc_projects.update({
        where: {
          id: projectId,
        },
        data: {
          milestones: getProjectWithProjectId.milestones,
        },
      });
    }


    await prisma.dc_projects.update({
      where: {
        id: projectId,
      },
      data: {
        milestones: getProjectWithProjectId.milestones,
        projectvalue: projectValue,
      },
    });


    await checkAndMarkMilestonesOnSmartsheet(projectId, selectedMilestone);
    responseObj.code = 200;
    responseObj.message = "Success";

  } catch (e) {
    responseObj.code = 200;
    responseObj.message = e.message;
  }

  return responseObj;
};
