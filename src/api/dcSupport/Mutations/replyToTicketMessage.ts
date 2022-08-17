import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import SupportPalApi from "../../../domain/services/supportpal/SupportPalApi";

export const replyToTicketMessage = async (root, args, context) => {
  let replyToTicketMessageResponseObj

  const { ticketId, message, attachment } = args;

  try {
    const user = await authenticate(context, "DD");

    const res = await replyTicketMessage(
      ticketId,
      user,
      message,
      attachment
    );
    replyToTicketMessageResponseObj = { code: 200, message: res.message, data: res.data }
    return replyToTicketMessageResponseObj;

  } catch (error) {
    replyToTicketMessageResponseObj = { code: 400, message: error.message }
    return replyToTicketMessageResponseObj;
  }

};
const replyTicketMessage = async (ticketId, user, message, attachment) => {
  const supportpalapi = new SupportPalApi()
  const response: any = await supportpalapi.postToSupportPalApi(
    "ticket/message",
    {
      ticket_id: ticketId,
      text: message,
      user_id: String(user.supportpaloperatorid),
      attachment
    }
  );

  return response;
}
