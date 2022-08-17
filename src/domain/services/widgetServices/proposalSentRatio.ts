import { prisma } from "../../../prismaConfig"
import { getUser } from "../../../api/users/Mutations/GetUser";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
dayjs.extend(isBetween)
dayjs.extend(isoWeek)

export const proposalSentRatio = async (user, month) => {
    const oppopredicate: any = {}
    let res;

    switch (user.profile.access_level) {
        case 0:
            oppopredicate.design_user__c = user.salesforceuserid;
            res = getProposalSentData(
                oppopredicate,
                month
            );
            break;
        case 1:
            const fetchedUser = await getUser(user.userid)

            oppopredicate.OR = []
            await Promise.all(
                fetchedUser[0].teams?.map(async (team) => {
                    oppopredicate.OR.push({
                        studio_name__c: team.name
                    })

                })
            );
            res = getProposalSentData(
                oppopredicate,
                month
            );
            break;
    }
    return res;
}

const getProposalSentData = async (opportunityPredicate, month) => {
    console.log("OPportunity Predicate", opportunityPredicate);
    let opportunityCount = 0;
    let oppotunityProposalSentCount = 0;


    const opportunities = await prisma.opportunity.findMany({
        where: opportunityPredicate
    });
    const date = new Date();
    const currentMonthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const currentMonthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const lastMonthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const lastMonthEnd = new Date(date.getFullYear(), date.getMonth() - 1 + 1, 0);


    opportunities.map((opportunity) => {
        const createdDate = dayjs(opportunity.createddate);
        const stagename = opportunity.stagename;
        if (month === 0) {
            if (createdDate.isBetween(currentMonthStart, currentMonthEnd, "days", "[]")) {
                opportunityCount++;
            }
            if (createdDate.isBetween(currentMonthStart, currentMonthEnd, "days", "[]") && stagename === "Proposal Sent") {
                oppotunityProposalSentCount++;
            }
        } else if (month === 1) {
            if (createdDate.isBetween(lastMonthStart, lastMonthEnd, "days", "[]")) {
                opportunityCount++;
            }
            if (createdDate.isBetween(lastMonthStart, lastMonthEnd, "days", "[]") && stagename === "Proposal Sent") {
                oppotunityProposalSentCount++;
            }
        }


    })
    let percentage;

    if (opportunityCount !== 0) {
        percentage = (oppotunityProposalSentCount * 100) / opportunityCount;
    }
    else {
        percentage = 0;
    }

    return {
        percentage: percentage,
        totalProposalSent: oppotunityProposalSentCount,
        totalMeetingDone: opportunityCount
    };
}
