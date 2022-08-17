import SupportCaseStatusEnum from "../../../../domain/enumerations/SupportCaseStatusEnum ";
import HttpError from "standard-http-error";
import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";
import { SupportPalBaseUsecase } from "../../../../domain/services/baseUseCase/supportpalBaseUseCase";
import { getTicketStatus } from "../../../dcSupport/Queries/fetchTickets";

export const viewAllRaisedTickets = async (root, args, context) => {
  let viewAllTicketsResponse;
  const { casenumber } = args;
  try {
    const user = await authenticate(context, "CD");

    let resdataArr = [];

    let responseArr: any[] = [];
    let totalCases = 0;
    let openCases = 0;
    let closedCases = 0;
    const TicketStatus = await getTicketStatus(args.status);
    resdataArr = await supportTickets(user, TicketStatus, casenumber);

    let dataArr;
    if (resdataArr.length) {
      dataArr = resdataArr;
    } else {
      viewAllTicketsResponse = { code: 200, data: [] };
      return viewAllTicketsResponse;
    }
    await Promise.all(
      dataArr.map(async (data) => {
        const obj = {
          ticketId: "",
          caseNumber: "",
          status: "",
          subject: "",
          description: "",
          isClosed: false,
          createdDate: "",
          customerName: "",
          departmentName: "",
        };
        obj.ticketId = data.id;
        obj.caseNumber = data.number;
        obj.status = data.status.name;
        obj.subject = data.subject;
        obj.customerName = data.user.formatted_name;
        obj.departmentName = data.department.name;
        const descriptionData = data.last_reply.purified_text;
        if (descriptionData) {
          obj.description = descriptionData.replace(/(<([^>]+)>)/gi, "");
        }
        obj.createdDate = data.created_at
          ? new Date(data.created_at * 1000).toDateString()
          : "-";
        if (data.status.id === SupportCaseStatusEnum.OPEN) {
          obj.isClosed = false;
          openCases++;
        } else if (data.status.id === SupportCaseStatusEnum.CLOSED) {
          obj.isClosed = true;
          closedCases++;
        }
        responseArr.push(obj);
      })
    );
    responseArr = await reverse(responseArr);
    totalCases = responseArr.length;

    viewAllTicketsResponse = {
      code: 200,
      data: responseArr,
      totalTickets: totalCases,
      openTickets: openCases,
      closedTickets: closedCases,
    };
    return viewAllTicketsResponse;
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
const supportTickets = async (user, statusArr, casenumber) => {
  let res;
  const resdataArr = [];
  if (statusArr && statusArr.length !== 0) {
    await Promise.all(
      statusArr.map(async (openstatus) => {
        res = await SupportPalBaseUsecase().getAllTickets(
          user,
          openstatus,
          casenumber
        );
        res.data.map((resdata) => {
          resdataArr.push(resdata);
        });
      })
    );
  } else {
    res = await SupportPalBaseUsecase().getAllTickets(user, null, casenumber);
    res.data.map((resdata) => {
      resdataArr.push(resdata);
    });
  }
  return resdataArr;
};
