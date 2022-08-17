import HttpError from "standard-http-error";
import SupportPalApi from "../supportpal/SupportPalApi";
import { ProfileTypeEnumCode } from "../../../domain/enumerations/ProfileTypeEnumUtil";

const supportpalapi = new SupportPalApi();
const message = "Operator not found";

export const SupportPalBaseUsecase = () => {
  const spurl = "ticket/ticket";

  const getAllTickets = async (user, status = null, casenumber = null) => {
    let url = spurl;

    const operatorId = user.supportpaloperatorid;
    const operatorEmail = user.customeremail;

    console.log("OPERATOR EMAIL====>" + operatorEmail);
    console.log("OPERATOR ID====>" + operatorId);

    if (operatorEmail || operatorId) {
      if (operatorId) {
        url += "?user=" + operatorId;
      } else if (operatorEmail) {
        const operatorIdFromEmail = await getOrAddUserAndReturnId(
          operatorEmail,
          user.name
        );

        user.supportpaloperatorid = operatorIdFromEmail;

        await user.save();

        if (operatorIdFromEmail) {
          url += "?user=" + operatorIdFromEmail;
        }
      }
    } else {
      throw Error("Kindly update email in view profile");
    }
    if (url !== spurl) {
      if (status) {
        url += "&status=" + status;
      }
      if (casenumber) {
        url += "&number=" + casenumber;
      }

      console.log(
        "SupportPalApi URL ===================================>>>>>>>>>>>>>>>>" +
          url
      );

      const tickets: any = await supportpalapi.getFromSupportPalApi(url);
      return tickets;
    } else {
      throw new HttpError(400, message);
    }
  };
  const getAllTicketsBasedOnUser = async (
    id,
    user,
    supportreq,
    status,
    searchKey,
    searchValue,
    pageRequestBody
  ) => {
    const { pageSize, pageIndex } = pageRequestBody;

    let url = spurl;
    if (user) {
      switch (user.profileid) {
        case ProfileTypeEnumCode.IN_HOUSE_DESIGNER:
        case ProfileTypeEnumCode.DESIGN_PARTNER:
          url += `?customfield[` + `${id}` + `]=` + `${user.designcafeemail}`;
          break;
        case ProfileTypeEnumCode.ASSOCIATE_STUDIO_MANAGER:
        case ProfileTypeEnumCode.STUDIO_MANAGER:
        case ProfileTypeEnumCode.STUDIO_MANAGER_DP:
        case ProfileTypeEnumCode.CENTER_DELIVERY_HEAD:
        case ProfileTypeEnumCode.CITY_DELIVERY_HEAD:
          url += `?customfield[` + `${id}` + `]=` + `${supportreq}`;
          break;
        default:
          url += "?assigned=" + id;
          break;
      }
    }
    if (url !== spurl) {
      url = await getUrl(url, status, searchKey, searchValue);
      if (pageSize) {
        url += "&limit=" + pageSize;
      }
      if (pageIndex) {
        url += "&start=" + pageIndex;
      }
    } else {
      if (pageSize) {
        url += "?limit=" + pageSize;
      }
      if (pageIndex) {
        url += "&start=" + pageIndex;
      }
      url = await getUrl(url, status, searchKey, searchValue);
    }

    console.log(
      "SupportPalApi URL ===================================>>>>>>>>>>>>>>>>" +
        url
    );

    const tickets: any = await supportpalapi.getFromSupportPalApi(url);

    return tickets;
  };
  const getTicketMessages = async (ticketId) => {
    const url = `ticket/message?ticket_id=${ticketId}&is_draft=0`;
    const messages: any = await supportpalapi.getFromSupportPalApi(url);
    return messages;
  };

  const getSupportpalCustomField = () => {
    return {
      MGDC: 133,
      WDC: 134,
      HSRDC: 135,
      "Mumbai DC": 136,
      "Hyderabad DC": 137,
      "Chennai DC": 138,
      JPDC: 272,
      KDRMYS: 273,
      YERPUN: 274,
      BHHYD: 275,
      "Thane DC": 276,
      SJPBLR: 277,
      KHMUM: 278,
      WLMUM: 279,
      OMRCH: 280,
      HRBRBLR: 281,
      Unknown: 139,
      "Pre 5%": 46,
      "5% - 15%": 47,
      "15% - 35%": 48,
      "35% - 45%": 49,
      "45% to handover": 50,
      "Post Handover": 51,
      "Customer Dashboard": 157,
      cf_experienceCenterPk: 22,
      cf_projectNamePk: 3,
      cf_clientidPk: 27,
      cf_projectStagePk: 14,
      cf_sourcePk: 25,
      cf_ticketBucket: 21,
      cf_assigned_designer: 13,
      cf_team_name: 26,
      "TEAM_BHHYD-DPStd-1": 158,
      "TEAM_BHHYD-Std-1": 159,
      "TEAM_Chennai DP": 160,
      "TEAM_Chennai Studio 1": 161,
      "TEAM_DP Bangalore HSRDC": 162,
      "TEAM_DP Bangalore MGDC": 163,
      "TEAM_DP Bangalore WDC": 164,
      "TEAM_DP Hyderabad": 165,
      "TEAM_DP Mumbai": 166,
      "TEAM_DP Thane": 167,
      "TEAM_HSRDC Studio 1": 168,
      "TEAM_Hyderabad Studio 1": 169,
      "TEAM_MGDC Studio 1": 170,
      "TEAM_MGDC Studio 2": 171,
      "TEAM_Mumbai Studio 1": 172,
      "TEAM_Mumbai Studio 2": 173,
      "TEAM_Mumbai Studio 3": 174,
      "TEAM_SJPBLR-Std-1": 288,
      "TEAM_Thane Studio 1": 175,
      "TEAM_WDC Studio 1": 176,
      "TEAM_JPDC XPresso": 283,
      "TEAM_KDRMYS-Std-1": 284,
      "TEAM_KDRMYS-DPStd-1": 285,
      "TEAM_YERPUN-Std-1": 286,
      "TEAM_YERPUN-DPStd-1": 287,
      "TEAM_KHMUM-Std-1": 289,
      "TEAM_KHMUM-DPStd-1": 290,
      "TEAM_WLMUM-Std-1": 291,
      "TEAM_WLMUM-DPStd-1": 292,
      "TEAM_OMRCH-Std-1": 340,
      "TEAM_HRBRBLR-Std-1": 293,
      46: "Pre 5%",
      47: "5% - 15%",
      48: "15% - 35%",
      49: "35% - 45%",
      50: "45% to handover",
      51: "Post Handover",
    };
  };
  return {
    getAllTickets,
    getOrAddOperatorAndReturnId,
    getOrAddUserAndReturnId,
    getSupportpalCustomField,
    getAllTicketsBasedOnUser,
    createOperator,
    createUser,
    getTicketMessages,
  };
};
const getOrAddOperatorAndReturnId = async (email, name, operatorGroup) => {
  let operatorId;
  let response: any;
  try {
    response = await supportpalapi.getFromSupportPalApi(
      "user/operator?email=" + email
    );
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  const res = response;

  if (res.data && res.data[0]) {
    operatorId = res.data[0]?.id;
  } else {
    console.log("name =================> ", name);

    const split = name.split(" ");
    const fn = split[0];
    const ln = split[1];
    const operator = await createOperator({
      firstname: fn,
      lastname: ln,
      email: email,
      password: process.env.supportPalDCPassword,
      group: operatorGroup,
    });
    if (operator) {
      if (operator?.status === "error") {
        throw new HttpError(401, operator.message);
      }
      operatorId = operator.data?.id;
    } else {
      throw new HttpError(400, message);
    }
  }
  return operatorId;
};
const createOperator = async (operatorBody: any) => {
  const { firstname, lastname, email, password, group } = operatorBody;

  const body = {
    firstname,
    lastname,
    email,
    password,
    // default fields
    country: "IN",
    timezone: "Asia/Kolkata",
    active: 1,
    groups: [group],
    depts: [process.env.supportPalDepartment],
  };
  const users: any = await supportpalapi.postToSupportPalApi(
    "user/operator",
    body
  );

  return users;
};

const getOrAddUserAndReturnId = async (email, name) => {
  try {
    let operatorId;
    let response: any;
    try {
      response = await supportpalapi.getFromSupportPalApi(
        "user/user?email=" + email
      );
    } catch (err) {
      throw new HttpError(400, err.message);
    }
    const res = response;

    if (res.data && res.data[0]) {
      operatorId = res.data[0]?.id;
    } else {
      const split = name.split(" ");
      const fn = split[0] ? split[0] : " ";
      const ln = split[1] ? split[1] : " ";
      const operator = await createUser({
        firstname: fn,
        lastname: ln,
        email: email,
        password: process.env.supportPalDCPassword,
        group: 4,
      });
      if (operator) {
        if (operator?.status === "error") {
          throw new HttpError(401, operator.message);
        }
        operatorId = operator.data?.id;
      } else {
        throw new HttpError(400, "Operator not found");
      }
    }
    return operatorId;
  } catch (error) {
    throw new HttpError(400, error.message);
  }
};

const createUser = async (userBody: any) => {
  console.log("CREATE USER CALLED");
  try {
    const { firstname, lastname, email, password, group } = userBody;

    const body = {
      firstname,
      lastname,
      email,
      password,
      // default fields
      country: "IN",
      timezone: "Asia/Kolkata",
      active: 1,
      groups: [group],
      depts: [process.env.supportPalDepartment],
    };
    const users: any = await supportpalapi.postToSupportPalApi(
      "user/user",
      body
    );
    return users;
  } catch (error) {
    throw new HttpError(400, error.message);
  }
};
const getUrl = async (url, status, searchKey, searchValue) => {
  if (status) {
    url += "&status=" + status;
  }
  if (searchKey && searchValue) {
    if (searchKey === "casenumber") {
      url += "&number=" + searchValue;
    } else if (searchKey === "projectname") {
      url += "&customfield[1]=" + searchValue;
    }
  }

  return url;
};
