import { prisma } from "../../../prismaConfig";
import HttpError from "standard-http-error";
import { checkAndMarkMilestonesOnSmartsheet } from "../../../utils/commonUtils";

enum ScheduleMeetingsEnum {
  SCHEDULE_SURVEY_MEETING = "Schedule Site Survey",
  SCHEDULE_KYC_MEETING = "Schedule KYC Meeting",
  SCHEDULE_DESIGN_PRESENTATION_MEETING = "Schedule Design Presentation",
  SCHEDULE_REVISION_MEETING = "Schedule Design Revision",
  SCHEDULE_SIGNOFF_MEETING = "Schedule Signoff Meeting"
}
const schedulerArray = [
  ScheduleMeetingsEnum.SCHEDULE_SURVEY_MEETING,
  ScheduleMeetingsEnum.SCHEDULE_REVISION_MEETING,
  ScheduleMeetingsEnum.SCHEDULE_KYC_MEETING,
  ScheduleMeetingsEnum.SCHEDULE_DESIGN_PRESENTATION_MEETING,
  ScheduleMeetingsEnum.SCHEDULE_SIGNOFF_MEETING
];

export const meetingSchedulerMilestone = async (_root, _args, _context) => {
  let selectedMilestone;
  try {
    if (!schedulerArray.includes(_args.meetingScheduleType)) {
      throw new HttpError(400, "Scheduler type invalid.");
    }
    const projectData: any = await prisma.dc_projects.findFirst({
      where: { id: _args.projectId },
    });
    if (!projectData) {
      throw new HttpError(400, "Project not found");
    }
    if (!projectData.milestones || projectData.milestones.length === 0) {
      throw new HttpError(400, "Milestone not found");
    }
    const milestoneData =
      projectData?.milestones?.attributes?.milestone_details;
    milestoneData.forEach((element) => {
      if (
        element.milestone_checklist &&
        element.milestone_checklist.length !== 0
      ) {
        const milestoneChecklist = element?.milestone_checklist;
        milestoneChecklist.forEach((val) => {
          if (
            val.length !== 0 &&
            val?.checklist_string === _args.meetingScheduleType
          ) {
            selectedMilestone = element;
            val.is_checked = true;
            val.data = {
              datetime: _args.datetime,
              meetingType: _args.meetingType,
            };
            val.description = _args.description;
          }
        });
      }
    });
    projectData.milestones.attributes.milestone_details = milestoneData;
    await prisma.dc_projects.update({
      where: { id: _args.projectId },
      data: { milestones: projectData.milestones },
    });
    if (selectedMilestone) {
      await checkAndMarkMilestonesOnSmartsheet(
        _args.projectId,
        selectedMilestone
      );
    }
    return {
      code: 200,
      message: "Meeting scheduled successfully.",
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error.message);
  }
};
