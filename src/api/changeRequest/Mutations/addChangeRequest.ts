import { prisma } from "../../../prismaConfig";
import {
  BookingFormStatusEnumNames,
  ProjectProposalEnums,
  requestStage,
} from "../../../domain/enumerations/ChangeRequestEnums";
import HttpError from "standard-http-error";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";

export const addChangeRequest = async (_root, args, _context) => {
  try {
    /********************************************************************************
     Need to add email trigger to designer everytime customer makes a change request.
    *********************************************************************************/
    const customer = await authenticate(_context, "CD");
    let createRequest;
    if (args.stage === requestStage.BOOKINGFORM) {
      if (customer.bookingformstatus === BookingFormStatusEnumNames.ACCEPTED) {
        throw new HttpError(
          400,
          "User has already accepted the booking form, Change Request cannot be initiated."
        );
      }
      createRequest = await prisma.dc_change_request.create({
        data: {
          request_type: args.request_type,
          description: args.description,
          stage: args.stage,
          created_at: new Date(),
          customerid: customer.customerid,
        },
      });
      await prisma.dc_customer.update({
        where: { customerid: customer.customerid },
        data: {
          bookingformstatus: BookingFormStatusEnumNames.CHANGE_REQUESTED,
        },
      });
    } else if (requestStage.PROJECTPROPOSAL === args.stage) {
      if (!args.quoteSfId) {
        throw new HttpError(400, "Sales force quote id is required");
      }
      const quoteData = await prisma.quote.findFirst({
        where: { sfid: args.quoteSfId },
      });
      if (quoteData.status === ProjectProposalEnums.ACCEPTED) {
        throw new HttpError(
          400,
          "User has already accepted the proposal, Change Request cannot be initiated."
        );
      }
      createRequest = await prisma.dc_change_request.create({
        data: {
          request_type: args.request_type,
          description: args.description,
          stage: args.stage,
          created_at: new Date(),
          quotesfid: args.quoteSfId,
          customerid: customer.customerid,
        },
      });
      const changeRequestList = quoteData.change_request_list__c
        ? JSON.parse(quoteData.change_request_list__c)
        : [];
      changeRequestList.push(createRequest.id);
      await prisma.quote.update({
        where: { sfid: args.quoteSfId },
        data: {
          status: ProjectProposalEnums.CHANGE_REQUESTED,
          change_request_list__c: JSON.stringify(changeRequestList),
        },
      });
    } else if (requestStage.DESIGNSIGNOFF === args.stage) {
      if (!args.projectId) {
        throw new HttpError(400, "project id is required");
      }
      const projectData = await prisma.dc_projects.findFirst({
        where: { id: args.projectId },
      });
      if (projectData.signoffstatus === ProjectProposalEnums.ACCEPTED) {
        throw new HttpError(
          400,
          "User has already accepted the design signoff document, Change Request cannot be initiated."
        );
      }
      await prisma.dc_projects.update({
        where: { id: args.projectId },
        data: {
          signoffstatus: "change_requested",
        },
      });
      createRequest = await prisma.dc_change_request.create({
        data: {
          request_type: args.request_type,
          description: args.description,
          stage: args.stage,
          created_at: new Date(),
          customerid: customer.customerid,
          projectid: args.projectId,
        },
      });
    }
    return {
      code: createRequest ? 200 : 400,
      message: createRequest
        ? "Change request created successfully."
        : "Something went wrong.",
      data: createRequest ? createRequest : "",
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error.message);
  }
};
