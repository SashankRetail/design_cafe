import { prisma } from "../../../prismaConfig";
import HttpError from "standard-http-error";
export const getRoomList = async (_root, args, _context) => {
  try {
    let quoteData, response, roomList;
    if (args.isPreSales) {
      if (!args.quoteSfId) {
        throw new HttpError(400, "Salesforce quote id is required.");
      }
      quoteData = await prisma.quote.findFirst({
        where: { sfid: args.quoteSfId },
      });
      if (quoteData.dc_room_list__c) {
        roomList = getRoomListArray(quoteData.dc_room_list__c);
      }
      response = roomList ? roomList : [];
    } else {
      if (!args.quoteId) {
        throw new HttpError(400, "project quote id is required.");
      }
      quoteData = await prisma.dc_project_quotes.findFirst({
        where: { id: args.quoteId },
      });
      roomList = quoteData.roomlist;
      response = roomList ? roomList : [];
    }
    return {
      code: quoteData ? 200 : 201,
      data: response,
      message: quoteData ? "success" : "Quote not found",
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error.message);
  }
};

const getRoomListArray = (roomsArray) => {
  const stringifyRoomlist = JSON.parse(
    JSON.stringify(roomsArray).replace(/&quot;/g, '\\"')
  );
  return JSON.parse(stringifyRoomlist);
};
