import { prisma } from "../../../prismaConfig";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { getUser } from "../../../api/users/Mutations/GetUser";
export const getBrodcastLeadsForUser = async (_root, _args, _context) => {
  const broadcastLeadResponse = { code: 200, message: "success", data: null };
  try {
    const user = await authenticate(_context, "DD");
    if (user) {
      const fetcheduser = await getUser(user.userid);
      console.log("fetcheduser", fetcheduser[0]);
      let whereCondition: any = {};
      const fetchedProfile = await prisma.dc_profile.findFirst({
        where: {
          profileid: fetcheduser[0].profileid,
        },
      });

      console.log(21, fetchedProfile.access_level);
      switch (fetchedProfile.access_level) {
        case 0:
          if (fetcheduser[0].iseligibleforleadmeetings) {
            whereCondition = {
              design_user__c: null,
              status: "Meeting Scheduled",
              broadcast_status__c: "0",
              OR: fetcheduser[0].teams?.map((teamAssignedToUser) => {
                return { designer_team_name__c: teamAssignedToUser.name };
              }),
              AND: {
                OR: [
                  {
                    NOT: {
                      rejected_by__c: {
                        contains: fetcheduser[0].userid.toString(),
                      },
                    },
                  },
                  { rejected_by__c: null },
                ],
              },
            };
          } else {
            broadcastLeadResponse.code = 400;
            broadcastLeadResponse.message =
              "You are not eligible for conducting meetings";
            return broadcastLeadResponse;
          }
          break;

        case 1:
          whereCondition = {
            OR: fetcheduser[0].teams?.map((team) => {
              return { designer_team_name__c: team.name };
            }),
            broadcast_status__c: "0",
            design_user__c: null,
            status: "Meeting Scheduled",
          };
          break;

        case 2:
          whereCondition = {
            OR: fetcheduser[0].experiencecenters?.map((expCenter) => {
              return { meeting_venue__c: expCenter.name };
            }),
            broadcast_status__c: "0",
            design_user__c: null,
            status: "Meeting Scheduled",
          };
          break;

        case 3:
          whereCondition = {
            OR: fetcheduser[0].cities?.map((city) => {
              return { region__c: city.name };
            }),
            broadcast_status__c: "0",
            design_user__c: null,
            status: "Meeting Scheduled",
          };
          break;

        case 4:
          whereCondition = {
            broadcast_status__c: "0",
            design_user__c: null,
            status: "Meeting Scheduled",
          };
          break;
        default:
          broadcastLeadResponse.code = 400;
          broadcastLeadResponse.message = "Profile not set for given user";
          return broadcastLeadResponse;
      }
      console.log(48, JSON.stringify(whereCondition));
      const broadcastedLeads = await prisma.lead.findMany({
        where: whereCondition,
      });
      console.log(81818181, broadcastedLeads.length);
      broadcastLeadResponse.data = [...broadcastedLeads];
    } else {
      broadcastLeadResponse.code = 400;
      broadcastLeadResponse.message = "No User found with given id";
    }
  } catch (e) {
    broadcastLeadResponse.code = 400;
    broadcastLeadResponse.message = e.message;
    console.log(e);
  }
  return broadcastLeadResponse;
};
