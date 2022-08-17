import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";
import SupportPalApi from "../../../../domain/services/supportpal/SupportPalApi";
import { SupportPalBaseUsecase } from "../../../../domain/services/baseUseCase/supportpalBaseUseCase";
import SupportPalConcernTypeEnum from "../../../../domain/enumerations/SupportPalConcernTypeEnum.ts";
import { ProjectStageEnumUtil } from "../../../../domain/enumerations/ProjectStageEnums";

export const raiseTicket = async (root, args, context) => {
  let raiseTicketResponse;

  const { concerntype, subject, description, attachment, ticketbucket } = args;

  try {
    const customer = await authenticate(context, "CD");

    const concerntypeArray = Object.values(SupportPalConcernTypeEnum);
    if (concerntype === "") {
      throw new HttpError(400, "Concern type is required");
    }
    if (subject === "") {
      throw new HttpError(400, "Subject is required");
    }
    if (description === "") {
      throw new HttpError(400, "Description is required");
    }
    if (!concerntypeArray.includes(concerntype)) {
      throw new HttpError(400, "invalid concern type");
    }
    const project = await prisma.dc_projects.findFirst({
      where: { customerid: customer.customerid },
    });
    try {
      const response = await executeSupportPalApi(
        customer,
        subject,
        description,
        project,
        attachment,
        ticketbucket
      );
      if (response && response.message === "Successfully created new ticket!") {
        raiseTicketResponse = {
          code: 200,
          message: "Your ticket has been created successfully",
        };
        return raiseTicketResponse;
      } else {
        raiseTicketResponse = {
          code: 400,
          message: "Oops something went wrong",
        };
        return raiseTicketResponse;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  } catch (error) {
    raiseTicketResponse = { code: 400, message: error.message };
    return raiseTicketResponse;
  }
};
const executeSupportPalApi = async (
  customer: any,
  subject: any,
  description: any,
  project: any,
  attachment: any,
  ticketbucket: any
) => {
  try {
    let designer = null,
      chm = null,
      projectname = null,
      projectid = null,
      expCenter = "",
      teamName = "";
    if (project) {
      if (project.designerid) {
        designer = await prisma.dc_users.findFirst({
          where: { userid: project.designerid },
        });
      }
      if (project.chmid) {
        chm = await prisma.dc_users.findFirst({
          where: { userid: project.chmid },
        });
      }

      if (project.experienceCenterid) {
        const expCenterResult = await getExperienceCenterInfo(
          project.experienceCenterid
        );
        expCenter =
          expCenterResult.name === undefined ? "Unknown" : expCenterResult.name;
      }

      if (project.designstudioid) {
        const teamResult = await getTeamInfo(project.designstudioid);
        teamName = teamResult.name;

        teamName = "TEAM_" + teamName;
      }
      projectname = project.projectname;
      projectid = project.projectid;
    }

    const chmId = await getChmOperatorId(chm);

    let designerId,
      designerEmail = null;
    if (designer) {
      const designername = (
        `${designer.firstname}` +
        " " +
        `${designer.lastname}`
      ).trim();
      designerEmail = designer.designcafeemail;

      if (!designer.supportpaloperatorid) {
        designer.supportpaloperatorid =
          await SupportPalBaseUsecase().getOrAddOperatorAndReturnId(
            designer.designcafeemail,
            designername,
            2
          );
        designerId = designer.supportpaloperatorid;
        await prisma.dc_users.update({
          data: designer,
          where: { userid: designer.userid },
        });
      } else {
        designerId = designer.supportpaloperatorid;
      }
    }
    const username = (
      `${customer.firstname}` +
      " " +
      `${customer.lastname}`
    ).trim();
    let customerId;
    if (!customer.supportpaloperatorid) {
      if (!customer.customeremail) {
        throw new HttpError(
          400,
          "Please provide your email id to proceed forward"
        );
      }
      customer.supportpaloperatorid =
        await SupportPalBaseUsecase().getOrAddUserAndReturnId(
          customer.customeremail,
          username
        );
      customerId = customer.supportpaloperatorid;
      await prisma.dc_customer.update({
        data: { supportpaloperatorid: customerId },
        where: { customerid: customer.customerid },
      });
    } else {
      customerId = customer.supportpaloperatorid;
    }

    const attachments = [];
    if (attachment) {
      attachment.documents.forEach((file) => {
        attachments.push({
          filename: file.fileName,
          contents: file.data,
        });
      });
    }

    const supportPalCFInfo = SupportPalBaseUsecase().getSupportpalCustomField();

    const source = "Customer Dashboard";

    //console.log(87, currentPaymentStage)

    let ticketResponse: any = [];
    if (customerId) {
      const postCustomerTicket = {
        user: customerId,
        user_email: customer.customeremail,
        priority: 1,
        status: 1,
        brand: 1,
        assignedto: chmId,
        subject: subject,
        text: description,
        customfield: {
          4: process.env.caseType,
          [supportPalCFInfo.cf_experienceCenterPk]: supportPalCFInfo[expCenter],
          [supportPalCFInfo.cf_projectNamePk]: projectname,
          [supportPalCFInfo.cf_clientidPk]: projectid,
          //[supportPalCFInfo.cf_projectStagePk]: supportPalCFInfo[currentPaymentStage],
          [supportPalCFInfo.cf_sourcePk]: supportPalCFInfo[source],
          [supportPalCFInfo.cf_ticketBucket]: ticketbucket,
          [supportPalCFInfo.cf_assigned_designer]: designerEmail,
          [supportPalCFInfo.cf_team_name]: supportPalCFInfo[teamName],
        },
        department: process.env.supportPalDepartment,
        attachment: attachments,
      };

      console.log("POST PARM TICKET====", postCustomerTicket);

      ticketResponse = await createTicket(postCustomerTicket);
      return ticketResponse;
    } else {
      ticketResponse = new HttpError(
        400,
        "Kindly visit to your team page and come back"
      );
      return ticketResponse;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createTicket = async (body) => {
  const supportpalapi = new SupportPalApi();
  const tickets: any = await supportpalapi.postToSupportPalApi(
    "ticket/ticket",
    body
  );
  return tickets;
};

const getExperienceCenterInfo = async (experiencecenterid) => {
  return prisma.dc_experiencecenters.findFirst({
    where: { centerid: experiencecenterid },
  });
};
const getTeamInfo = async (teamid) => {
  return prisma.dc_teams.findFirst({ where: { id: teamid } });
};
const getCurrentPaymentStage = async (project) => {
  let currentPaymentStage;
  if (!project || project.projectstatus.toLowerCase() === "draft") {
    currentPaymentStage = "Pre 5%";
  } else {
    if (project.currentmilestone) {
      if (
        project.currentmilestone === "Handover" &&
        project.projectstatus === "completed"
      ) {
        currentPaymentStage = "Post Handover";
      } else {
        currentPaymentStage = await ProjectStageEnumUtil.getCurrentMilestone(
          project.currentmilestone
        );
      }
    }
  }
  return currentPaymentStage;
};
const getChmOperatorId = async (chm) => {
  let chmname,
    chmId = [];
  if (chm) {
    chmname = (`${chm.firstname}` + " " + `${chm.lastname}`).trim();
    if (!chm.supportpaloperatorid) {
      chm.supportpaloperatorid =
        await SupportPalBaseUsecase().getOrAddOperatorAndReturnId(
          chm.designcafeemail,
          chmname,
          3
        );
      chmId = [chm.supportpaloperatorid];
      await prisma.dc_users.update({
        data: chm,
        where: { userid: chm.userid },
      });
    } else {
      chmId = [chm.supportpaloperatorid];
    }
  }
  return chmId;
};
