import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import SupportPalApi from "../../../domain/services/supportpal/SupportPalApi";

export const updateTicketStatus = async (root, args, context) => {
  let updateTicketStatusResponseObj

  const { ticketId, status } = args;

  try {
    const user = await authenticate(context, "DD");

    const res = await updateTicket(user, ticketId, status); // 2 for closed
    updateTicketStatusResponseObj = { code: 200, message: res.message, data: res.data }
    return updateTicketStatusResponseObj;

  } catch (error) {
    updateTicketStatusResponseObj = { code: 400, message: error.message }
    return updateTicketStatusResponseObj;
  }

};
const updateTicket = async (user, ticketId, status) => {
  const supportpalapi = new SupportPalApi()
  const response: any = await supportpalapi.updateToSupportPalApi(
    "ticket/ticket/" + ticketId,
    {
      status,
    }
  );
  return response;
}
