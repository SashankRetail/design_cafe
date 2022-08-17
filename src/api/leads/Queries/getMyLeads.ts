import { prisma } from "../../../prismaConfig";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { getUser } from "../../users/Mutations/GetUser";

export const getMyLeads = async (_root, args, _context) => {
  const myLeadResponse = { code: 200, message: "success", data: null };
  try {
    const { searchText, filterPreset, sortByMeetingScheduled, sortByName } =
      args;
    let user;
    try {
      user = await authenticate(_context, "DD");
    } catch (error) {
      myLeadResponse.code = 401;
      myLeadResponse.message = error.message;
    }
    if (user) {
      const fetcheduser = await getUser(user.userid);
      const fetchedProfile = await prisma.dc_profile.findFirst({
        where: {
          profileid: fetcheduser[0].profileid,
        },
      });

      console.log(21, fetchedProfile.access_level);
      let whereCondition: any = {};
      const statusQuery = [
        { status: "Meeting Scheduled" },
        { status: "Meeting Confirmed" },
      ];
      const searchCondition = [
        {
          name: { contains: searchText ? searchText : "", mode: "insensitive" },
        },
        { mobilephone: { contains: searchText ? searchText : "" } },
      ];
      if (user.salesforceuserid || user.profileid === 8) {
        switch (fetchedProfile.access_level) {
          case 0:
            whereCondition = {
              AND: {
                OR: statusQuery,
                AND: {
                  OR: searchCondition,
                  AND: createFilterConditions(args),
                },
              },
              design_user__c: user.salesforceuserid,
            };
            break;

          case 1:
            whereCondition = {
              AND: {
                OR: fetcheduser[0].teams?.map((team) => {
                  return {
                    designer_team_name__c: team.name,
                  };
                }),
                AND: {
                  OR: statusQuery,
                  AND: {
                    OR: searchCondition,
                    AND: createFilterConditions(args),
                  },
                },
              },
            };
            whereCondition.NOT = {
              design_user__c: null,
            };
            break;

          case 2:
            whereCondition = {};
            whereCondition.AND = {
              OR: fetcheduser[0].experiencecenters.map((expCenter) => {
                return {
                  meeting_venue__c: expCenter.name,
                };
              }),
              AND: {
                OR: statusQuery,
                AND: {
                  OR: searchCondition,
                  AND: createFilterConditions(args),
                },
              },
            };
            whereCondition.NOT = {
              design_user__c: null,
            };
            break;

          case 3:
            whereCondition = {};
            whereCondition.AND = {
              OR: fetcheduser[0].cities.map((city) => {
                return {
                  region__c: city.name,
                };
              }),
              AND: {
                OR: statusQuery,
                AND: {
                  OR: searchCondition,
                  AND: createFilterConditions(args),
                },
              },
            };
            whereCondition.NOT = {
              design_user__c: null,
            };
            break;
          case 4:
            whereCondition = {
              OR: searchCondition,
              NOT: {
                design_user__c: null,
              },
              AND: {
                OR: statusQuery,
                AND: createFilterConditions(args),
              },
            };
            break;
          default:
            myLeadResponse.code = 400;
            myLeadResponse.message = "Profile not set for given user";
            return myLeadResponse;
        }

        switch (filterPreset) {
          case 1:
            whereCondition.design_user__c = null;
            break;
          case 2:
            break;
          case 3:
            whereCondition.AND.AND.OR = { status: "Meeting Scheduled" };
            break;
          case 4:
            whereCondition.AND.AND.OR = { status: "Meeting Confirmed" };
            break;
          default:
            break;
        }

        const orderByArr = [];
        if (sortByMeetingScheduled) {
          orderByArr.push({
            willingness_for_meeting__c: sortByMeetingScheduled,
          });
        }

        if (sortByName) {
          orderByArr.push({ name: sortByName });
        }

        console.log(9494, JSON.stringify(whereCondition));
        const myLeads = await prisma.lead.findMany({
          where: whereCondition,
          orderBy: orderByArr,
        });

        myLeadResponse.data = [...myLeads];
        console.log(143, myLeads.length);
      } else {
        myLeadResponse.code = 200;
        myLeadResponse.data = [];
        myLeadResponse.message =
          "No salesforce id tagged to this particular user";
      }
    } else {
      myLeadResponse.code = 400;
      myLeadResponse.message = "No User found with given id";
    }
  } catch (e) {
    console.log(e);
    myLeadResponse.message = e.message;
    myLeadResponse.data = null;
  }
  return myLeadResponse;
};
const createFilterConditions = (args) => {
  const {
    fromDate,
    toDate,
    teamNames,
    designerNames,
    citys,
    experienceCenters,
  } = args;
  const filterConditions: any = {};
  const orCondition = [];

  if (teamNames) {
    teamNames.forEach((teamName) => {
      orCondition.push({
        designer_team_name__c: { contains: teamName, mode: "insensitive" },
      });
    });
  }
  filterConditions.AND = orCondition;
  if (designerNames) {
    designerNames.forEach((designerName) => {
      orCondition.push({
        design_user_name__c: { contains: designerName, mode: "insensitive" },
      });
    });
  }
  filterConditions.AND = orCondition;

  if (citys) {
    citys.forEach((cityName) => {
      orCondition.push({
        region__c: { contains: cityName, mode: "insensitive" },
      });
    });
  }
  filterConditions.AND = orCondition;

  if (experienceCenters) {
    experienceCenters.forEach((experienceCenter) => {
      orCondition.push({
        meeting_venue__c: { contains: experienceCenter, mode: "insensitive" },
      });
    });
  }

  filterConditions.AND = orCondition;
  console.log(fromDate, toDate);
  if (fromDate && toDate) {
    orCondition.push({
      willingness_for_meeting__c: {
        gte: fromDate,
        lte: toDate,
      },
    });
  }
  filterConditions.AND = orCondition;

  console.log("filterConditions", JSON.stringify(filterConditions));
  return filterConditions;
};
