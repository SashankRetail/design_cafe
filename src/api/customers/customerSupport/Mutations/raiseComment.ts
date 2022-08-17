import SupportPalApi from "../../../../domain/services/supportpal/SupportPalApi";
import HttpError from "standard-http-error";
import { authenticateDdCd } from "../../../../core/authControl/verifyAuthUseCase";

export const raiseComment = async (root, args, context) => {
  const { ticketId, message, attachment } = args;

  try {
    const res = await authenticateDdCd(context);
    let user;
    if (res.user) {
      user = res.user;
    } else if (res.customer) {
      user = res.customer;
    }
    const attachments: any[] = [];
    if (attachment) {
      attachment.documents.forEach((file) => {
        attachments.push({ filename: file.fileName, contents: file.data });
      });
    }
    if (!user.supportpaloperatorid) {
      return {
        code: 400,
        message: "Operator not found in supportpal to send message",
      };
    }
    const msg = await replyTicketMessage(ticketId, user, message, attachments);

    if (msg && msg.message === "Successfully created new message!") {
      return { code: 200, message: "Successfully created new message!" };
    } else {
      console.log("What went wrong", msg);
      throw new HttpError(400, "Ooops something went wrong");
    }
  } catch (error) {
    return { code: 400, message: error.message };
  }
};
const replyTicketMessage = async (ticketId, user, message, attachment) => {
  const supportpalapi = new SupportPalApi();
  const response: any = await supportpalapi.postToSupportPalApi(
    "ticket/message",
    {
      ticket_id: ticketId,
      text: message,
      user_id: user.supportpaloperatorid,
      attachment,
    }
  );
  return response;
};
