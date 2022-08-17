import { prisma } from "../../../prismaConfig"
import { getUser } from "../../../api/users/Mutations/GetUser";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isBetween)
dayjs.extend(isoWeek)

export const leadSummaryRatio = async (user, monthInReq) => {
    let leadPredicate: any = {}
    let opportunitypredicate: any = {}
    let res;
    switch (user.profile.access_level) {
        case 0:
            leadPredicate.OR = []
            leadPredicate.OR.push(
                { status: "Meeting Scheduled" },
                { status: "Meeting Confirmed" },
                { status: "Converted" }
            )
            leadPredicate.AND = { design_user__c: user.salesforceuserid }

            opportunitypredicate.design_user__c = user.salesforceuserid;


            res = getLeadSummaryData(
                leadPredicate,
                opportunitypredicate,
                monthInReq
            );
            break;
        case 1:
            const fetchedUser = await getUser(user.userid)

            const teamArr = []
            const stageNameArr = []
            const designers: any = {}
            designers.OR = []
            opportunitypredicate.OR = []

            const statusQuery = [
                { status: "Meeting Scheduled" },
                { status: "Meeting Confirmed" },
                { status: "Converted" }
            ]


            await Promise.all(

                fetchedUser[0].teams?.map(async (team) => {
                    teamArr.push({
                        designer_team_name__c: team.name
                    })
                    stageNameArr.push({
                        studio_name__c: team.name
                    })
                })
            );
            leadPredicate = {
                OR: statusQuery,
                AND: {
                    OR: teamArr,
                }
            }
            opportunitypredicate = {
                OR: stageNameArr
            }

            res = getLeadSummaryData(
                leadPredicate,
                opportunitypredicate,
                monthInReq
            );
            break;
    }
    return res
}
const getLeadSummaryData = async (predicate, opportunityPredicate, month) => {
    console.log("Lead predicate", predicate);
    console.log("OPportunity Predicate", opportunityPredicate);
    const leads = await prisma.lead.findMany({
        where: predicate
    });
    const opportunities = await prisma.opportunity.findMany({
        where: opportunityPredicate
    });
    let leadMeetingScheduledCount = 0,
        opportunityMeetingDoneCount = 0,
        opportunityClosedWonCount = 0,
        opportunityClosedLostCount = 0

    const date = new Date();
    const currentMonthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const currentMonthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const lastMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastMonthEnd = new Date(date.getFullYear(), date.getMonth() - 1 + 1, 0);

    if (month === 0) {

        leads.map((lead) => {
            const meetingScheduledDate = dayjs(lead.willingness_for_meeting__c);
            if (meetingScheduledDate.isBetween(currentMonthStart, currentMonthEnd, "days", "[]")) {
                leadMeetingScheduledCount++
            }

        })

        opportunities.map((opportunity) => {
            const stagename = opportunity.stagename;
            const createdDate = dayjs(opportunity.createddate);

            const closedDate = dayjs(opportunity.closedate)
            if (createdDate.isBetween(currentMonthStart, currentMonthEnd, "days", "[]")
            ) {
                opportunityMeetingDoneCount++
            }
            if (closedDate.isBetween(currentMonthStart, currentMonthEnd, "days", "[]") && stagename === "Closed Won") {
                opportunityClosedWonCount++
            }
            if (closedDate.isBetween(currentMonthStart, currentMonthEnd, "days", "[]") && stagename === "Closed Lost") {
                opportunityClosedLostCount++
            }
        })
    } else if (month === 1) {

        leads.map((lead) => {
            const meetingScheduledDate = dayjs(lead.willingness_for_meeting__c);
            if (meetingScheduledDate.isBetween(lastMonthStart, lastMonthEnd, "days", "[]")) {
                leadMeetingScheduledCount++
            }

        })
        opportunities.map((opportunity) => {
            const stagename = opportunity.stagename;
            const createdDate = dayjs(opportunity.createddate);

            const closedDate = dayjs(opportunity.closedate)
            if (createdDate.isBetween(lastMonthStart, lastMonthEnd, "days", "[]")
            ) {
                opportunityMeetingDoneCount++
            }
            if (closedDate.isBetween(lastMonthStart, lastMonthEnd, "days", "[]") && stagename === "Closed Won") {
                opportunityClosedWonCount++
            }
            if (closedDate.isBetween(lastMonthStart, lastMonthEnd, "days", "[]") && stagename === "Closed Lost") {
                opportunityClosedLostCount++
            }
        })

    }
    let leadConversion;

    if (opportunityMeetingDoneCount !== 0) {
        leadConversion = (opportunityClosedWonCount * 100) / opportunityMeetingDoneCount;
    }
    else {
        leadConversion = 0;
    }
    return {
        meetingScheduled: leadMeetingScheduledCount,
        meetingDone: opportunityMeetingDoneCount,
        closeWon: opportunityClosedWonCount,
        closedLost: opportunityClosedLostCount,
        percentage: leadConversion
    };
}
