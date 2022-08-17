import { prisma } from "../../../prismaConfig";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { requestStage } from "../../../domain/enumerations/ChangeRequestEnums";
import HttpError from "standard-http-error";
export const getChangeRequest = async (_root, args, _context) => {
  try {
    const customer = await authenticate(_context, "CD");
    let changeRequest;
    if (args.stage === requestStage.BOOKINGFORM) {
      changeRequest = await prisma.dc_change_request.findMany({
        where: { customerid: customer.customerid },
      });
    } else if (args.stage === requestStage.PROJECTPROPOSAL) {
      if (!args.quotesfid) {
        throw new HttpError(400, "Sales force quote id is required");
      }
      changeRequest = await prisma.dc_change_request.findMany({
        where: { quotesfid: args.quotesfid },
      });
    }
    return {
      code: changeRequest ? 200 : 400,
      message: changeRequest ? "success" : "Bad Request",
      data: changeRequest,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
