import { prisma } from "../../../prismaConfig"
import TimePeriodLeadMeetingEnum from "../../enumerations/TimePeriodLeadMeetingEnum";
import { getUser } from "../../../api/users/Mutations/GetUser";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isBetween)
dayjs.extend(isoWeek)

const meetingScheduled = "Meeting Scheduled";
const meetingConfirmed = "Meeting Confirmed";
const converted = "Converted";
export const upcomingMeetingsRatio = async (user, timePeriod) => {
  try {
    let upcomingMeeting;
    if (user.profile.access_level === 0) {
      upcomingMeeting = getDesignerUpcomingMeeting(
        user,
        timePeriod
      );
    } else if (user.profile.access_level === 1) {
      upcomingMeeting = await getTeamMeetings(user, timePeriod);
    }
    return { upcomingMeeting };
  } catch (error) {
    return error
  }
}
const getDesignerUpcomingMeeting = async (user, weekInReq) => {
  let totalMeeting = 0;
  const leadData = [];

  const predicate: any = {}
  predicate.design_user__c = user.salesforceuserid
  predicate.OR = []
  predicate.OR.push({ status: meetingScheduled }, { status: meetingConfirmed }, { status: converted })
  const leads = await prisma.lead.findMany({ where: predicate })
  const mStartOfWeek = dayjs().startOf('isoWeek').isoWeekday(2).toDate();
  const mEndofweek = dayjs().endOf('isoWeek').toDate()
  const mstartofNextWeek = dayjs().add(1, 'week').startOf('isoWeek').isoWeekday(2).toDate()
  const mEndOfnextWeek = dayjs().add(1, 'week').endOf('isoWeek').toDate()
  console.log("mStartOfWeek = ", mStartOfWeek,
    "mEndofweek = ", mEndofweek,
    "mstatrofNextWeek =", mstartofNextWeek,
    "mEndOfnextWeek = ", mEndOfnextWeek)

  leads.map((lead) => {
    const mDate = dayjs(lead.willingness_for_meeting__c)

    if (weekInReq === TimePeriodLeadMeetingEnum.THIS_WEEK) {
      if (
        mDate.isBetween(mStartOfWeek, mEndofweek, "days", "[]")
      ) {
        totalMeeting++
        leadData.push({
          meetingScheduledDate: lead.willingness_for_meeting__c,
          leadName: lead.name
        })
      }
    }

    if (weekInReq === TimePeriodLeadMeetingEnum.NEXT_WEEK) {
      if (
        mDate.isBetween(mstartofNextWeek, mEndOfnextWeek, "days", "[]")
      ) {
        totalMeeting++
        leadData.push({
          meetingScheduledDate: lead.willingness_for_meeting__c,
          leadName: lead.name
        })
      }
    }
    if (weekInReq === TimePeriodLeadMeetingEnum.ALL) {
      totalMeeting++
      leadData.push({
        meetingScheduledDate: lead.willingness_for_meeting__c,
        leadName: lead.name
      })
    }

  })
  return {
    totalMeeting,
    leadData
  }

}
const getTeamMeetings = async (user, timePeriod) => {
  let totalMeeting = 0;
  const leadData = [];

  const statusPredicate: any = {}
  statusPredicate.OR = []
  statusPredicate.OR.push({ status: meetingScheduled }, { status: meetingConfirmed }, { status: converted })
  const fetchedUser = await getUser(user.userid)
  const predicate: any = {}
  predicate.OR = []
  fetchedUser[0].teams?.forEach(team => {
    predicate.OR.push({
      designer_team_name__c: team.name
    })
  });
  const mainPredicate: any = {}
  mainPredicate.AND = []
  mainPredicate.AND.push(predicate)
  mainPredicate.AND.push(statusPredicate)
  const leads = await prisma.lead.findMany({ where: mainPredicate });
  console.log("total leads", leads.length);

  const mStartOfWeek = dayjs().startOf('isoWeek').isoWeekday(2).toDate();
  const mEndofweek = dayjs().endOf('isoWeek').toDate()
  const mstartofNextWeek = dayjs().add(1, 'week').startOf('isoWeek').isoWeekday(2).toDate()
  const mEndOfnextWeek = dayjs().add(1, 'week').endOf('isoWeek').toDate()
  console.log("mStartOfWeek = ", mStartOfWeek,
    "mEndofweek = ", mEndofweek,
    "mstatrofNextWeek =", mstartofNextWeek,
    "mEndOfnextWeek = ", mEndOfnextWeek)

  for (const lead of leads) {
    const mDate = dayjs(lead.willingness_for_meeting__c);
    if (timePeriod === TimePeriodLeadMeetingEnum.THIS_WEEK) {
      if (
        mDate.isBetween(mStartOfWeek, mEndofweek, "days", "[]")
      ) {
        totalMeeting++
        leadData.push({
          meetingScheduledDate: lead.willingness_for_meeting__c,
          leadName: lead.name
        })
      }
    }

    if (timePeriod === TimePeriodLeadMeetingEnum.NEXT_WEEK) {
      if (
        mDate.isBetween(mstartofNextWeek, mEndOfnextWeek, "days", "[]")
      ) {
        totalMeeting++
        leadData.push({
          meetingScheduledDate: lead.willingness_for_meeting__c,
          leadName: lead.name
        })
      }
    }
    if (timePeriod === TimePeriodLeadMeetingEnum.ALL) {
      totalMeeting++
      leadData.push({
        meetingScheduledDate: lead.willingness_for_meeting__c,
        leadName: lead.name
      })
    }

  }
  return {
    totalMeeting,
    leadData
  }

}
