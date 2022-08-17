import { prisma } from "../../../prismaConfig"
import { getUser } from "../../../api/users/Mutations/GetUser";

export const broadcastedLeadsRatio = async (user) => {
    let count;
    const fetchedUser = await getUser(user.userid)
    const whereCondition: any = {};

    switch (user.profile.access_level) {
        case 0:
            if (fetchedUser[0].iseligibleforleadmeetings) {
                whereCondition.broadcast_status__c = "0";
                whereCondition.OR = [];
                fetchedUser[0].teams.forEach((teamAssignedToUser) => {
                    whereCondition.OR.push({
                        designer_team_name__c: teamAssignedToUser.name,
                    });
                });

                const leadsForDesigner = await prisma.lead.findMany({ where: whereCondition })
                count = await fetchMatchingLeads(leadsForDesigner)
            } else {
                count = 0
            }
            break;
        case 1:
            whereCondition.broadcast_status__c = "0";
            whereCondition.OR = [];
            fetchedUser[0].teams.forEach((team) => {
                whereCondition.OR.push({
                    designer_team_name__c: team.name,
                });
            });

            const leadsForStudio = await prisma.lead.findMany({ where: whereCondition })
            count = await fetchMatchingLeads(leadsForStudio)
            break;
    }
    return count
}

const fetchMatchingLeads = async (leads) => {
    let newleads = 0;
    const date = new Date()
    const today = `${date.getFullYear()}` + `-` + `${(date.getMonth() + 1)}` + `-` + `${date.getDate()}`;

    leads.map((lead) => {
        const leadDateWithTime = lead.willingness_for_meeting__c;
        if (leadDateWithTime) {
            const lddate = `${leadDateWithTime.getFullYear()}` + `-` + `${(leadDateWithTime.getMonth() + 1)}` + `-` + `${leadDateWithTime.getDate()}`;
            const todayDate = new Date(today)
            const leadDate = new Date(lddate)

        if (leadDate > todayDate){
                console.log(lead.id)
                newleads++;
            }
        }
    })
    return newleads;
}

