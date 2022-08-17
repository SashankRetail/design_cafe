import { prisma } from "../../../prismaConfig";
import HttpError from "standard-http-error";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { SupportPalBaseUsecase } from "../../../domain/services/baseUseCase/supportpalBaseUseCase";
import { ProfileTypeEnumCode } from "../../../domain/enumerations/ProfileTypeEnumUtil";

export const fetchTickets = async (root, args, context) => {
  let fetchTicketsResponseObj;

  try {
    const user = await authenticate(context, "DD");

    let resdataArr = [];
    let responseArr: any[] = [];

    const supportPalCFInfo = SupportPalBaseUsecase().getSupportpalCustomField();
    const pagesize = await getpageSize(args.pageSize);
    const TicketStatus = await getTicketStatus(args.status);

    const pageRequestBody = {
      pageSize: pagesize,
      pageIndex: args.pageIndex,
    };

    switch (user.profileid) {
      case ProfileTypeEnumCode.IN_HOUSE_DESIGNER:
      case ProfileTypeEnumCode.DESIGN_PARTNER:
        resdataArr = await supportData(
          13,
          user,
          null,
          TicketStatus,
          args.searchKey,
          args.searchValue,
          pageRequestBody
        );
        break;
      case ProfileTypeEnumCode.ASSOCIATE_STUDIO_MANAGER:
      case ProfileTypeEnumCode.STUDIO_MANAGER:
      case ProfileTypeEnumCode.STUDIO_MANAGER_DP:
        const supportTeam = [];
        const teams = await prisma.dc_users_team.findMany({
          where: { userid: user.userid },
        });

        await Promise.all(
          teams.map(async (team) => {
            const teamres = await prisma.dc_teams.findFirst({
              where: { id: team.teamid },
            });

            const supportTeamId = supportPalCFInfo["TEAM_" + teamres.name];

            supportTeam.push(supportTeamId);
          })
        );

        resdataArr = await supportData(
          26,
          user,
          supportTeam,
          TicketStatus,
          args.searchKey,
          args.searchValue,
          pageRequestBody
        );
        break;
      case ProfileTypeEnumCode.SYSTEM_ADMINISTRATOR:
      case ProfileTypeEnumCode.ALL_INDIA_BUSINESS_HEAD:
      case ProfileTypeEnumCode.CHM_MANAGER:
        resdataArr = await supportData(
          null,
          null,
          null,
          TicketStatus,
          args.searchKey,
          args.searchValue,
          pageRequestBody
        );
        break;
      case ProfileTypeEnumCode.CENTER_DELIVERY_HEAD:
        const supportCenter = [];
        const centers = await prisma.dc_users_experiencecenters.findMany({
          where: { userid: user.userid },
        });
        await Promise.all(
          centers.map(async (center) => {
            const centerres = await prisma.dc_experiencecenters.findFirst({
              where: { centerid: center.centerid },
            });

            const supportCenterId = supportPalCFInfo[centerres.name];

            supportCenter.push(supportCenterId);
          })
        );
        resdataArr = await supportData(
          22,
          user,
          supportCenter,
          TicketStatus,
          args.searchKey,
          args.searchValue,
          pageRequestBody
        );
        break;
      case ProfileTypeEnumCode.CITY_DELIVERY_HEAD:
        const supportCity = [];
        const cities = await prisma.dc_users_city.findMany({
          where: { userid: user.userid },
        });
        await Promise.all(
          cities.map(async (city) => {
            const cityres = await prisma.dc_cities.findFirst({
              where: { id: city.cityid },
            });

            const supportCityId = supportPalCFInfo[cityres.name];

            supportCity.push(supportCityId);
          })
        );
        resdataArr = await supportData(
          23,
          user,
          supportCity,
          TicketStatus,
          args.searchKey,
          args.searchValue,
          pageRequestBody
        );
        break;

      default:
        resdataArr = await supportData(
          user.supportpaloperatorid,
          user,
          null,
          TicketStatus,
          args.searchKey,
          args.searchValue,
          pageRequestBody
        );
        break;
    }
    let dataArr;
    if (resdataArr.length) {
      dataArr = resdataArr;
    } else {
      fetchTicketsResponseObj = { code: 200, data: [] };
      return fetchTicketsResponseObj;
    }
    await Promise.all(
      dataArr.map(async (data) => {
        const obj = {
          ticketId: "",
          caseNumber: "",
          status: "",
          subject: "",
          isClosed: false,
          createdDate: "",
          projectName: "",
          designerName: "",
          customerName: "",
          chmname: "",
        };
        obj.ticketId = data.id;
        obj.caseNumber = data.number;
        obj.status = data.status.name;
        obj.subject = data.subject;

        await Promise.all(
          data.customfields.map(async (customfield) => {
            switch (customfield.field_id) {
              case 27:
                obj.projectName = customfield.value;
                break;
              case 13:
                const designer = await prisma.dc_users.findFirst({
                  where: { designcafeemail: customfield.value },
                });
                if (designer) {
                  obj.designerName =
                    `${designer.firstname}` + " " + `${designer.lastname}`;
                } else {
                  obj.designerName = "";
                }
                break;
            }
          })
        );
        const customerName =  getCustomerName(data)
        obj.customerName = customerName;

        if (data.assigned[0]) {
          obj.chmname =
            `${data.assigned[0].firstname}` +
            " " +
            `${data.assigned[0]?.lastname}`;
        } else {
          obj.chmname = "";
        }

        obj.createdDate = new Date(data.created_at * 1000).toDateString();
        responseArr.push(obj);
      })
    );
    responseArr = await reverse(responseArr);

    fetchTicketsResponseObj = { code: 200, data: responseArr };
    return fetchTicketsResponseObj;
  } catch (error) {
    throw new HttpError(400, error);
  }
};
const reverse = async (responseArr) => {
  if (responseArr.length) {
    responseArr.reverse();
  } else {
    responseArr = [];
  }

  return responseArr;
};
const supportData = async (
  id,
  user,
  supportdata,
  statusArr,
  searchKey,
  searchValue,
  pageRequestBody
) => {
  let res;
  let resdataArr = [];
  if (supportdata && supportdata.length !== 0) {
    await Promise.all(
      supportdata.map(async (supportreq) => {
        if (statusArr && statusArr.length !== 0) {
          statusArr.map(async (statusreq) => {
            res = await SupportPalBaseUsecase().getAllTicketsBasedOnUser(
              id,
              user,
              supportreq,
              statusreq,
              searchKey,
              searchValue,
              pageRequestBody
            );
            res.data.map((resdata) => {
              resdataArr.push(resdata);
            });
          });
        } else {
          res = await SupportPalBaseUsecase().getAllTicketsBasedOnUser(
            id,
            user,
            supportreq,
            null,
            searchKey,
            searchValue,
            pageRequestBody
          );
          res.data.map((resdata) => {
            resdataArr.push(resdata);
          });
        }
      })
    );
  } else {
    if (statusArr && statusArr.length !== 0) {
      await Promise.all(
        statusArr.map(async (statusreq) => {
          res = await SupportPalBaseUsecase().getAllTicketsBasedOnUser(
            id,
            user,
            null,
            statusreq,
            searchKey,
            searchValue,
            pageRequestBody
          );
          res.data.map((resdata) => {
            resdataArr.push(resdata);
          });
        })
      );
    } else {
      res = await SupportPalBaseUsecase().getAllTicketsBasedOnUser(
        id,
        user,
        null,
        null,
        searchKey,
        searchValue,
        pageRequestBody
      );
      res.data.map((resdata) => {
        resdataArr.push(resdata);
      });
    }
  }
  return resdataArr;
};
const getpageSize = async (pagesizeinreq) => {
  let pagesize;
  if (!pagesizeinreq) {
    pagesize = 50;
  } else {
    pagesize = pagesizeinreq;
  }
  return pagesize;
};
export const getTicketStatus = async (status) => {
  const TicketStatus = [];
  if (status) {
    if (status === 1) {
      TicketStatus.push(1, 3, 4, 5, 6);
    } else if (status === 2) {
      TicketStatus.push(2);
    } else {
      throw new HttpError(400, "Invalid status");
    }
  }

  return TicketStatus;
};
const getCustomerName = (data) => {
  const firstname = data.user.firstname ? data.user.firstname.trim() : "";
  const lastname = data.user.lastname ? data.user.lastname.trim() : "";
  return `${firstname ? firstname + " " : ""}${lastname}`;
}
