import { prisma } from "../../../prismaConfig";
import { checkAndMarkMilestonesOnSmartsheet } from "../../../utils/commonUtils";

export const completeMilestoneChecklist = async(_root, args, _context) => {
    const defaultResponseObj = {code:200, message:null, data:null}
    const { projectId, checkListName } = args;
    let selectedMilestone;
    try {
      const fetchedProject = await prisma.dc_projects.findUnique({
        where: {
          id: projectId,
        },
      });

      if(fetchedProject){
          fetchedProject?.milestones["attributes"]?.milestone_details?.forEach(
              (milestone) => {
                if (milestone.milestone_checklist.length > 0) {
                  milestone.milestone_checklist.forEach(async(milestoneChecklist) => {
                    if (milestoneChecklist.checklist_string === checkListName) {
                          milestoneChecklist.is_checked = true;
                          selectedMilestone = milestone;
                    }
                  });
                }
              }
            );

            await prisma.dc_projects.update({
                where:{
                  id:projectId
                },
                data:{
                  milestones:fetchedProject.milestones
                }
              })

        await checkAndMarkMilestonesOnSmartsheet(projectId,selectedMilestone);
        defaultResponseObj.code = 200;
        defaultResponseObj.message = "Milestone Updated";
    }
} catch (e) {
    defaultResponseObj.code = 400;
    defaultResponseObj.message = e.message;
  }

  return defaultResponseObj;
};
