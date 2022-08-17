import { prisma } from "../../../prismaConfig";
import {
  callExternalAPIWithPost,
  queryForFetchingRemindersTemplate,
} from "../../../utils/commonUtils";
import { triggerEmailNotification } from "../../../domain/services/baseUseCase/baseUseCase";

enum StageName {
  MEETING_SCHEDULED = "Meeting Scheduled",
  MEETING_CONFIRMED = "Meeting Confirmed",
  CONVERTED = "Converted",
  MEETING_DONE = "Meeting Done",
  PROPOSAL_SENT = "Proposal Sent",
  FOLLOW_UP = "Follow Up",
  DISCUSSION = "Discussion",
  AWAITING_CLOSURE = "Awaiting Closure",
  CLOSED_WON = "Closed Won",
  CLOSED_LOST = "Closed Lost",
}
enum SlugName {
  NOTIFYLEADSTAGE = "notify_lead_stage",
  NOTIFYLEADCONVERTED = "notify_lead_converted",
  NOTIFYOPPORTUNITYSTAGE = "notify_opportunity_stage",
  NOTIFYCLOSEDWON = "notify_closed_won",
  NOTIFYCLOSEDLOST = "notify_closed_lost",
}

export const triggerEmail = async (root, args, context) => {
  try {
    const { leadsfid, stagename, opportunitysfid } = args;
    let lead, opportunity, designer, studioManager, cc;
    let leadUrl,opportunityUrl;
    if (leadsfid) {
      lead = await prisma.lead.findFirst({ where: { sfid: leadsfid } });
      if (lead.design_user__c) {
        designer = await prisma.dc_users.findFirst({
          where: { salesforceuserid: lead.design_user__c },
        });
      }
      leadUrl = process.env.upcomingLeadsUrl + leadsfid + "&leadid=" + lead.id
    }
    if (opportunitysfid) {
      opportunity = await prisma.opportunity.findFirst({
        where: { sfid: opportunitysfid },
      });
      lead = await prisma.lead.findFirst({ where: { sfid: opportunity.lead_id__c } });
      if (opportunity.design_user__c) {
        designer = await prisma.dc_users.findFirst({
          where: { salesforceuserid: opportunity.design_user__c },
        });
      }
      opportunityUrl = process.env.completedLeadsUrl + opportunity.lead_id__c + "&oppourtunityId=" + opportunitysfid + "&leadid=" + lead.id
    }
    if (designer) {
      studioManager = await prisma.dc_users.findUnique({
        where: { userid: designer.reportingmanager },
      });
    }
    let slugname;
    switch (stagename) {
      case StageName.MEETING_SCHEDULED:
      case StageName.MEETING_CONFIRMED:
        slugname = SlugName.NOTIFYLEADSTAGE;
        break;
      case StageName.CONVERTED:
        slugname = SlugName.NOTIFYLEADCONVERTED;
        break;
      case StageName.MEETING_DONE:
      case StageName.PROPOSAL_SENT:
      case StageName.FOLLOW_UP:
      case StageName.DISCUSSION:
      case StageName.AWAITING_CLOSURE:
        slugname = SlugName.NOTIFYOPPORTUNITYSTAGE;
        break;
      case StageName.CLOSED_WON:
        slugname = SlugName.NOTIFYCLOSEDWON;
        cc = studioManager?.designcafeemail;
        break;
      case StageName.CLOSED_LOST:
        slugname = SlugName.NOTIFYCLOSEDLOST;
        break;
    }

    if (designer && designer.designcafeemail) {
      const notificationTemplate = await callExternalAPIWithPost(
        "https://cms.designcafe.com/graphqlm",
        queryForFetchingRemindersTemplate(slugname)
      );
      console.log(notificationTemplate);
      if (notificationTemplate) {
        const data = notificationTemplate?.data?.reminders.data[0].attributes;

        if (data.emailActivate) {
          const to = designer.designcafeemail;
          const subject = data.label;
          const content = data.email_template;
          const emailContent = content
            .replace("$Designer", designer?.firstname)
            .replace("$leadurl", leadUrl)
            .replace("$opportunityurl", opportunityUrl)
            .replace("$customer", opportunity?.name)
            .replace("$opportunityname", opportunity?.name);

          await triggerEmailNotification(to, subject, emailContent, cc);
        }
      }
      return { code: 200, message: "Email sent successfully" };
    } else {
      return { code: 400, message: "No designer found to send email" };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
