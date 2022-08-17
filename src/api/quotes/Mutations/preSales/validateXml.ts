import { prisma } from "../../../../prismaConfig";
import Parse from "xml-js";
import HttpError from "standard-http-error";
import {
  UploadFileOnS3,
  getBuffer,
  deleteBlob,
  getRoomNames,
} from "../../../../domain/services/baseUseCase/baseUseCase";
import { SITE_SERVICE } from "../../../../domain/enumerations/RoomTypesEnums";

export const validateXmlApi = async (_root, args, _context) => {
  try {
    /**************************************************************************
    Need to add authentication and send user info to save in attachments table.
    ***************************************************************************/
    const opportunityData = await prisma.opportunity.findFirst({
      where: {
        lead_id__c: args.leadId,
      },
    });
    if (!opportunityData) {
      throw new HttpError(400, "Opportunity not found");
    }
    const file = {
      key: args.fileName,
      contentType: args.contentType,
      base64: args.base64File,
      leadid: args.leadId,
    };
    const attachmentObj = await UploadFileOnS3(file);
    const xml: any = await getBuffer(attachmentObj.filekey);
    const result = await Parse.xml2json(xml, { compact: true, spaces: 4 });
    const mainObj = JSON.parse(result);
    const clientName = mainObj.XML.Order.Head.CONTACT_ADDRESS1._text;
    if (!clientName) {
      await removeFromBlobAndDB(attachmentObj);
      throw new HttpError(
        400,
        "Customer name not found. Please upload appropriate file!"
      );
    }

    if (clientName.split("-")[0] !== opportunityData?.name.split("-")[0]) {
      await removeFromBlobAndDB(attachmentObj);
      throw new HttpError(
        400,
        "Customer name did not match. Please upload appropriate file!"
      );
    }
    // modular/siteService Amount
    const commonAmount =
      parseFloat(mainObj.XML.Order.Head.ORDER_PRICE_INFO3._text) || 0;
    const totaltax =
      parseFloat(mainObj.XML.Order.Head.ORDER_PRICE_INFO4._text) || 0;
    const totalAmount =
      parseFloat(mainObj.XML.Order.Head.ORDER_PRICE_INFO5._text) || 0;
    // modular/siteService DiscountFromSplit;
    const commonDiscountFromSplit =
      mainObj.XML.Order.Head.CUSTOM_INFO4._text.split("%");
    // modular/siteService Discount
    const commonDiscount = parseInt(commonDiscountFromSplit) || 0;
    const discountedAmount =
      parseFloat(mainObj.XML.Order.Head.CUSTOM_INFO3._text) || 0;
    const absoluteDiscount =
      parseInt(mainObj.XML.Order.Head.CUSTOM_INFO5._text) || 0;
    const responseObj: any = {};
    responseObj.location = attachmentObj.location;
    responseObj.attachment = attachmentObj?.id;
    responseObj.filekey = attachmentObj?.filekey;
    responseObj.customerName = clientName;
    if (args.modular) {
      responseObj.modularValue = commonAmount;
      responseObj.modularBaseAmount = commonAmount;
      responseObj.modularTotalTax = totaltax;
      responseObj.modularTotalAmount = totalAmount;
      responseObj.modularDiscountedAmount = discountedAmount;
      responseObj.modularDiscountValue = commonDiscount;
      responseObj.modularFixedDiscount = absoluteDiscount;
    } else if (args.siteService) {
      responseObj.siteServiceValue = commonAmount;
      responseObj.siteServiceBaseAmount = commonAmount;
      responseObj.siteServiceTotalTax = totaltax;
      responseObj.siteServiceTotalAmount = totalAmount;
      responseObj.siteServiceDiscountedAmount = discountedAmount;
      responseObj.siteServiceDiscountValue = commonDiscount;
      responseObj.siteServiceFixedDiscount = absoluteDiscount;
    }
    const builderList = mainObj.XML.Order.BuilderList.Set;
    if (args.modular) {
      const roomsArr = getRoomNames(builderList);
      const rooms = roomsArr;
      for (const val of rooms) {
        const room = val;
        const roomlower = room.toLowerCase();
        if (SITE_SERVICE.includes(roomlower)) {
          await removeFromBlobAndDB(attachmentObj);
          throw new HttpError(
            400,
            "Oops! Looks like you've added incorrect room name on IMOS. Upload Site Services in a different field"
          );
        }
      }
    } else if (args.siteService) {
      const roomsArr2 = [];
      let count2 = 1;
      let roomNameFromSplit2;
      let _list = [];
      if (!Array.isArray(builderList)) {
        _list.push(builderList);
      } else {
        _list = builderList;
      }
      _list.forEach((element) => {
        if (count2 === Math.floor(element.hierarchicalPos._text)) {
          roomNameFromSplit2 = element.PVarString._text.split("ROOMNAME:=");
          roomsArr2.push(roomNameFromSplit2[1]);
          count2++;
        }
      });
      const rooms = roomsArr2;
      for (const value of rooms) {
        const room = value;
        const roomlower = room.toLowerCase();
        if (!SITE_SERVICE.includes(roomlower)) {
          await removeFromBlobAndDB(attachmentObj);
          throw new HttpError(
            400,
            "Opps! Looks like you've added incorrect room name on IMOS. Upload Modular in a different field"
          );
        }
      }
    }

    return {
      code: 200,
      data: responseObj,
      message: "Xml uploaded successfully!",
    };

    //#region remove from Blob and DB
    async function removeFromBlobAndDB(_attachment) {
      if (_attachment) {
        const attachmentFileKey = _attachment.location;
        const awsDeleteRes = await deleteBlob(attachmentFileKey);
        if (awsDeleteRes) {
          await prisma.dc_attachments.delete({
            where: {
              id: _attachment.id,
            },
          });
        }
      }
    }
    //#endregion
  } catch (error) {
    console.log(error);
    throw new HttpError(400, error);
  }
};
