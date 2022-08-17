import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { prisma } from "../../../prismaConfig";
import { getUser } from "../../users/Mutations/GetUser";

export const getMyOpportunities = async (_parent, args, _context) => {
  const myOpportunitiesResponse = { code: 200, message: "success", data: null };
  try {
    const { searchText, filterPreset, sortByMeetingScheduled, sortByName } =
      args;

    const user = await authenticate(_context, "DD");
    if (user) {
      const fetcheduser = await getUser(user.userid);
      const fetchedProfile = await prisma.dc_profile.findFirst({
        where: {
          profileid: fetcheduser[0].profileid,
        },
      });
      let whereCondition: any = {};
      const searchCondition = [
        {
          name: { contains: searchText ? searchText : "", mode: "insensitive" },
        },
        { mobile__c: { contains: searchText ? searchText : "" } },
      ];

      console.log(32, fetchedProfile.access_level);
      switch (fetchedProfile.access_level) {
        case 0:
          whereCondition = {
            design_user__c: user.salesforceuserid,
            OR: searchCondition,
            AND: createFilterConditions(args),
          };
          break;
        case 1:
          whereCondition = {
            AND: {
              OR: fetcheduser[0].teams?.map((team) => {
                return {
                  studio_name__c: team.name,
                };
              }),
              AND: createFilterConditions(args),
            },
            OR: searchCondition,
          };
          break;
        case 2:
          whereCondition = {
            AND: {
              OR: fetcheduser[0].experiencecenters.map((expCenter) => {
                return {
                  meeting_venue__c: expCenter.name,
                };
              }),
              AND: createFilterConditions(args),
            },
            OR: searchCondition,
          };
          break;
        case 3:
          whereCondition = {
            AND: {
              OR: fetcheduser[0].cities.map((city) => {
                return {
                  region__c: city.name,
                };
              }),
              AND: createFilterConditions(args),
            },
            OR: searchCondition,
          };
          break;
        case 4:
          whereCondition = {
            OR: searchCondition,
            AND: createFilterConditions(args),
          };
          break;
        default:
          myOpportunitiesResponse.code = 400;
          myOpportunitiesResponse.message = "Profile not set for given user";
          return myOpportunitiesResponse;
      }

      switch (filterPreset) {
        case 1:
          whereCondition.stagename = "Pending Quote Upload";
          break;
        case 2:
          whereCondition.stagename = "Meeting Done";
          break;
        case 3:
          whereCondition.stagename = "Proposal Sent";
          break;
        case 4:
          whereCondition.stagename = "Awaiting Closure";
          break;
        case 5:
          whereCondition.stagename = "Closed Won";
          break;
        case 6:
          whereCondition.stagename = "Closed Lost";
          break;
        default:
          break;
      }

      const orderByArr = [];
      if (sortByMeetingScheduled) {
        orderByArr.push({ createddate: sortByMeetingScheduled });
      }

      if (sortByName) {
        orderByArr.push({ name: sortByName });
      }

      console.log("whereCondition", JSON.stringify(whereCondition));
      const fetchedOpportunities = await prisma.opportunity.findMany({
        where: whereCondition,
        orderBy: orderByArr,
      });

      myOpportunitiesResponse.data = [...fetchedOpportunities];
      console.log(1111, fetchedOpportunities.length);
    } else {
      myOpportunitiesResponse.code = 400;
      myOpportunitiesResponse.message = "User Id Not Provided";
    }
  } catch (e) {
    myOpportunitiesResponse.code = 400;
    myOpportunitiesResponse.message = e.message;
    myOpportunitiesResponse.data = null;
  }
  return myOpportunitiesResponse;
};

const createFilterConditions = (args) => {
  const {
    fromDate,
    toDate,
    designerNames,
    stageNames,
    experienceCenters,
    regions,
    teams,
  } = args;
  const filterConditions: any = {};
  const orCondition = [];

  if (stageNames) {
    stageNames.forEach((stageName) => {
      orCondition.push({
        stagename: { contains: stageName },
      });
    });
  }
  filterConditions.AND = orCondition;

  if (teams) {
    teams.forEach((team) => {
      orCondition.push({
        studio_name__c: { contains: team, mode: "insensitive" },
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

  if (experienceCenters) {
    experienceCenters.forEach((experienceCenter) => {
      orCondition.push({
        meeting_venue__c: { contains: experienceCenter, mode: "insensitive" },
      });
    });
  }
  filterConditions.AND = orCondition;

  if (regions) {
    regions.forEach((region) => {
      orCondition.push({
        region__c: { contains: region, mode: "insensitive" },
      });
    });
  }
  filterConditions.AND = orCondition;

  if (fromDate && toDate) {
    orCondition.push({
      createddate: {
        gte: fromDate,
        lte: toDate,
      },
    });
  }
  filterConditions.AND = orCondition;

  return filterConditions;
};
