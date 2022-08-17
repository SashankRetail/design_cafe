import { prisma } from "../../../prismaConfig";
import {
  callExternalAPIWithPost,
  queryForFetchingRemindersTemplate,
} from "../../../utils/commonUtils";
import superagent from "superagent";

export const assignTeamToLead = async (_parent, args, _context) => {
  const assignTeamResponse = { code: 200, message: null, data: null };
  const { leadId } = args;
  const teams = [];
  const fetchedLeads = await prisma.lead.findFirst({
    where: {
      sfid: leadId,
    },
  });
  if (
    fetchedLeads.status === "Meeting Scheduled" ||
    fetchedLeads.status === "Meeting Confirmed"
  ) {
    if (!fetchedLeads.design_user__c && !fetchedLeads.designer_team_name__c) {
      if (fetchedLeads?.meeting_venue__c) {
        const fetchedExperienceCenter =
          await prisma.dc_experiencecenters.findFirst({
            where: {
              name: fetchedLeads?.meeting_venue__c,
            },
          });

        if (fetchedExperienceCenter) {
          const experienceCenterId = fetchedExperienceCenter.centerid;
          const fetchedAssignedTeamsIdToExperienccenter =
            await prisma.dc_teams_experiencecenters.findMany({
              where: { centerid: experienceCenterId },
              include: {
                team: true,
              },
            });

          if (fetchedAssignedTeamsIdToExperienccenter?.length > 0) {
            fetchedAssignedTeamsIdToExperienccenter.forEach((team) => {
              teams.push(team.team);
            });

            const roundRobinData = await prisma.dc_roundrobin.findFirst({
              where: {
                experiencecenterid: experienceCenterId,
              },
            });
            const teamNameAssignedToLead = await roundRobinLogic(
              roundRobinData,
              teams,
              experienceCenterId,
              leadId
            );
            assignTeamResponse.message = `Lead Successfully assigned to ${teamNameAssignedToLead}`;
            const teamwhatsapp = await prisma.dc_teams.findFirst({ where: { name: teamNameAssignedToLead } })
            await callwhatsappnotification(teamwhatsapp, leadId);
          } else {
            assignTeamResponse.code = 400;
            assignTeamResponse.message =
              "No Teams found for this particular experience center";
          }
        } else {
          assignTeamResponse.code = 400;
          assignTeamResponse.message =
            "No Experience center assigned to this lead";
        }
      } else {
        assignTeamResponse.code = 400;
        assignTeamResponse.message = "Lead Not Found";
      }
    } else {
      assignTeamResponse.code = 200;
      assignTeamResponse.message = "Lead already Broadcasted";
    }
  } else {
    assignTeamResponse.code = 200;
    assignTeamResponse.message = "Lead is not Meeting Scheduled stage";
  }
  return assignTeamResponse;
};

const roundRobinLogic = async (
  roundRobinData,
  teams,
  experienceCenterId,
  leadId
) => {
  let teamNameToBeAssignedToTheLead;
  let teamIdToBeAssignedToTheLead;
  if (roundRobinData) {
    const latestTeamIdAssignedToEC = roundRobinData.teamid;
    const indexOfTheTeamLatestAssignedToLead = teams.findIndex(
      (team) => team.id === latestTeamIdAssignedToEC
    );
    if (teams.length === indexOfTheTeamLatestAssignedToLead + 1) {
      teamNameToBeAssignedToTheLead = teams[0].name;
      teamIdToBeAssignedToTheLead = teams[0].id;
    } else {
      teamNameToBeAssignedToTheLead =
        teams[indexOfTheTeamLatestAssignedToLead + 1].name;
      teamIdToBeAssignedToTheLead =
        teams[indexOfTheTeamLatestAssignedToLead + 1].id;
    }
    await prisma.dc_roundrobin.update({
      where: {
        roundrobinid: roundRobinData.roundrobinid,
      },
      data: {
        teamid: teamIdToBeAssignedToTheLead,
      },
    });
  } else {
    //Experience center is new and needs to be added in the table
    await prisma.dc_roundrobin.create({
      data: {
        experiencecenterid: experienceCenterId,
        teamid: teams[0].id,
      },
    });
    teamNameToBeAssignedToTheLead = teams[0].name;
  }

  await prisma.lead.update({
    where: {
      sfid: leadId,
    },
    data: {
      designer_team_name__c: teamNameToBeAssignedToTheLead,
      broadcast_status__c: "0",
    },
  });
  return teamNameToBeAssignedToTheLead;
};

const callwhatsappnotification = async (teamwhatsapp, leadId) => {
  console.log("here");

  const usertobebroadcasted = await prisma.dc_users_team.findMany({ where: { teamid: teamwhatsapp.id } });
  console.log("user", usertobebroadcasted);
  const profiles = [
    { profile_name: "Inhouse Designer" },
    { profile_name: "Design Partner" },
    { profile_name: "Associate Studio Manager" }
  ];
  let whereConditionForProfiles: any = {};
  whereConditionForProfiles = {
    OR: profiles,
  };
  const profileIDtobebroadcasted = await prisma.dc_profile.findMany({ where: whereConditionForProfiles });
  const profileID = [];
  for await (const element of profileIDtobebroadcasted) {
    profileID.push(element.profileid);
  }
  console.log(profileID);
  const userID = [];
  for await (const element of usertobebroadcasted) {
    if (element.userid) {
      userID.push(element.userid);
    }
  }
  if (userID.length > 0) {
    const userstofetch = await prisma.dc_users.findMany({ where: { userid: { in: userID }, profileid: { in: profileID }, iseligibleforleadmeetings: true } })
    console.log(userstofetch);
    for await (const element of userstofetch) {
      const leadtofetch = await prisma.lead.findFirst({ where: { sfid: leadId } })
      const reminderTemplateForLeadBroadcast = await callExternalAPIWithPost(
        "https://cms.designcafe.com/graphqlm",
        queryForFetchingRemindersTemplate("notify_lead_broadcast")
      );
      if (reminderTemplateForLeadBroadcast) {
        const data = reminderTemplateForLeadBroadcast?.data?.reminders.data[0].attributes;
        console.log(data);
        const slug = data.slug;
        const to = element.phonenumber
        console.log("phonenumber", to);
        const link = process.env.leadDetailsUrl + leadtofetch.sfid + "&leadid=" + leadtofetch.id;
        const url = "https://app.yellowmessenger.com/api/engagements/notifications/v2/push";
        if (data.whatsappActive) {
          console.log("whatsapp");
          const whatsappresponse = await triggerWhatsappNotification(to, link, slug, userstofetch, leadtofetch, url);
          console.log("whatsappresponse", whatsappresponse);
        }
      }
    }
  }
}

const triggerWhatsappNotification = async (
  to,
  link,
  slug,
  userstofetch,
  leadtofetch,
  url
) => {
  console.log("trigger");
  const reqBody = JSON.stringify({
    userDetails: {
      number: "91" + to,
    },
    notification: {
      type: "whatsapp",
      sender: "916366910437",
      templateId: "new_lead_details",
      params: {
        "1": leadtofetch.name,
        "2": leadtofetch.willingness_for_meeting__c,
        "3": leadtofetch.meeting_venue__c,
        "4": leadtofetch.meeting_type__c,
        "5": leadtofetch.approx_budget__c,
        "6": leadtofetch.propertyaddress__c,
        "7": link,
      },
    },
  });
  try {
    const res = await superagent
      .post(url)
      .query("bot=x1647421621135")
      .set("Content-Type", "application/json")
      .set("x-api-key", process.env.kyellowMessengerXAuthToken)
      .send(reqBody);
    console.log("res.body", res.body);
    return res.body;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
