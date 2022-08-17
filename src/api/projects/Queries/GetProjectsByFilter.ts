import { prisma } from "../../../prismaConfig";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import ProjectFilterEnum from "../../../domain/enumerations/ProjectFilterEnum";
import HttpError from "standard-http-error";

export const getProjectsByFilter = async (_root, args, _context) => {
  try {
    const { searchText, filter, sorting } = args;
    let user;
    try {
      user = await authenticate(_context, "DD");
    } catch (error) {
      throw new HttpError(401, error.message);
    }
    if (user) {
      let whereClause: any = {};
      let orderBy: any = {};

      switch (user?.profile?.access_level) {
        case 0: {
          //Inhouse Designer :- only assigned projects.
          //Design Partner :- only assigned projects.
          //DesignerID/chmID/surveyID

          whereClause = {
            OR: [
              { designerid: user.userid },
              { chmid: user.userid },
              { surveyexecutiveid: user.userid },
            ],
          };
          break;
        }
        case 1: {
          //Studio Manager-DP :- Based on the studio.
          //Studio Manager :- Based on the studio.
          //CHM Manager :- Based on the studio.
          whereClause.OR = [];
          user.users_team?.forEach((team) => {
            whereClause.OR.push({ designstudioid: team.teamid });
          });
          break;
        }
        case 2: {
          //Center Delivery Head :- Based on the experience center.
          //Survey Executive :- Based on the experience center.
          whereClause.OR = [];
          user.users_experiencecenters?.forEach((experiencecenter) => {
            whereClause.OR.push({
              experiencecenterid: experiencecenter.centerid,
            });
          });
          break;
        }
        case 3: {
          //City Delivery Head :- Based on the city.
          whereClause.OR = [];
          user.users_city?.forEach((city) => {
            whereClause.OR.push({ cityid: city.cityid });
          });
          break;
        }
        case 4: {
          /* 2:Survey Manager, 6:All India Business Head, 8:System Administrator, 9:CEO have all project access.*/
          /* 5:Finance Executive, 7:3D Manager, 10:Associate Studio Manager, 12:Franchise Owner, 18:3D Designer-Shell,19:3D Designer-Renders access are not defined in PRD.*/
          whereClause = {};
          break;
        }
        default:
          return {
            code: 400,
            message: "Profile not set for given user",
          };
      }
      if (searchText && searchText !== "") {
        whereClause.AND = {
          AND: {
            OR: [
              {
                projectid: {
                  contains: searchText ? searchText : "",
                  mode: "insensitive",
                },
              },
              {
                projectname: {
                  contains: searchText ? searchText : "",
                  mode: "insensitive",
                },
              },
            ],
          },
        };
      } else if (filter && filter?.filterBy?.length !== 0) {
        filterConditions(filter, whereClause);
      } else if (sorting) {
        switch (sorting.sortBy.toLowerCase()) {
          case ProjectFilterEnum.PROJECT_NAME: {
            orderBy = { projectname: sorting.order };
            break;
          }
          case ProjectFilterEnum.DESIGNER: {
            orderBy = { designerid: sorting.order };
            break;
          }
          case ProjectFilterEnum.STUDIO: {
            orderBy = { designstudioid: sorting.order };
            break;
          }
          case ProjectFilterEnum.CITY: {
            orderBy = { cityid: sorting.order };
            break;
          }
          case ProjectFilterEnum.EC: {
            orderBy = { experiencecenterid: sorting.order };
            break;
          }
          case ProjectFilterEnum.SIGNUP_DATE: {
            orderBy = { signupdate: sorting.order };
            break;
          }
          default:
            break;
        }
      }
      const getProjects = await prisma.dc_projects.findMany({
        where: whereClause,
        orderBy: orderBy,
        include: {
          customer: true,
          designstudio: true,
          experiencecenter: true,
          city: true,
          designer: true,
          salesmanager: true,
          chm: true,
          surveyexecutive: true,
        },
      });
      getProjects?.forEach((element) => {
        delete element.milestones;
      });
      return {
        code: 200,
        message: "success",
        data: getProjects,
      };
    } else {
      return {
        code: 400,
        message: "Please provide UserID",
      };
    }
  } catch (error) {
    return error;
  }
};

const filterConditions = (filter, whereClause) => {
  const orCondition = [];
  const { designers, filterBy, studios, cities, ecs, status, currentStage } =
    filter;
  filterBy?.forEach((filterElement) => {
    if (filterElement.toLowerCase() === ProjectFilterEnum.DESIGNER) {
      //Filter Projects :- Based on the designer.
      console.log(123, designers);
      designers.forEach((designer) => {
        orCondition.push({
          designerid: designer,
        });
      });
      whereClause.AND = {
        AND: {
          OR: orCondition,
        },
      };
    }
    if (filterElement.toLowerCase() === ProjectFilterEnum.STUDIO) {
      //Filter Projects :- Based on the studio.
      studios.forEach((studio) => {
        orCondition.push({
          designstudioid: studio,
        });
      });
      whereClause.AND = {
        AND: {
          OR: orCondition,
        },
      };
    }
    if (filterElement.toLowerCase() === ProjectFilterEnum.CITY) {
      //Filter Projects :- Based on the city.
      cities.forEach((city) => {
        orCondition.push({
          cityid: city,
        });
      });
      whereClause.AND = {
        AND: {
          OR: orCondition,
        },
      };
    }
    if (filterElement.toLowerCase() === ProjectFilterEnum.EC) {
      //Filter Projects :- Based on the EC.
      ecs.forEach((ec) => {
        orCondition.push({
          experiencecenterid: ec,
        });
      });
      whereClause.AND = {
        AND: {
          OR: orCondition,
        },
      };
    }
    if (filterElement.toLowerCase() === ProjectFilterEnum.SIGNUP_DATE) {
      //Filter Projects :- Based on the SignUp Date.
      if (!filter.toDate || !filter.fromDate) {
        throw new HttpError(400, "Please provide proper to and from dates.");
      }
      orCondition.push({
        signupdate: {
          gte: filter.fromDate,
          lte: filter.toDate,
        },
      });
      whereClause.AND = {
        AND: {
          OR: orCondition,
        },
      };
    }
    if (filterElement.toLowerCase() === ProjectFilterEnum.STATUS) {
      //Filter Projects :- Based on the SignUp Status.
      status.forEach((element) => {
        orCondition.push({
          projectstatus: element,
        });
      });
      whereClause.AND = {
        AND: {
          OR: orCondition,
        },
      };
    }
    if (filterElement.toLowerCase() === ProjectFilterEnum.CURRENT_STAGE) {
      //Filter Projects :- Based on the SignUp Current Stage.
      currentStage.forEach((stage) => {
        orCondition.push({
          currentmilestone: stage,
        });
      });
      whereClause.AND = {
        AND: {
          OR: orCondition,
        },
      };
    }
  });
};
