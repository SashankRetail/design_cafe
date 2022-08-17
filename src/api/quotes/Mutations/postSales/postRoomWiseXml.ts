import { prisma } from "../../../../prismaConfig";
import Parse from "xml-js";
import HttpError from "standard-http-error";
import {
  UploadFileOnS3,
  getBuffer,
  deleteBlob,
  getRoomNames,
  getRoomListArrayFromXmlData,
} from "../../../../domain/services/baseUseCase/baseUseCase";
import { Prisma } from "@prisma/client";
import { SITE_SERVICE } from "../../../../domain/enumerations/RoomTypesEnums";

export const PostRoomwiseXmlApi = async (_root, args, _context) => {
  try {
    const file = {
      key: args.fileName,
      contentType: args.contentType,
      base64: args.base64File,
    };
    let _commonRoomList = [];
    const attachmentObj = await UploadFileOnS3(file);
    const xml: any = await getBuffer(attachmentObj.filekey);
    const result = await Parse.xml2json(xml, { compact: true, spaces: 4 });
    const mainObj = JSON.parse(result);
    const clientName = mainObj.XML.Order.Head.CONTACT_ADDRESS1._text;
    if (!clientName) {
      await removeFromBlobAndDB(attachmentObj);
      return {
        code: 400,
        message: "Customer name not found. Please upload appropriate file!",
      };
    }
    const builderList = mainObj.XML.Order.BuilderList.Set;
    // modular/siteService Amount
    const commonAmount = mainObj.XML.Order.Head.ORDER_PRICE_INFO3._text;
    // modular/siteService Discount
    const roomsArr = getRoomNames(builderList);
    // find project & customer meta data
    const projectMeta = await prisma.dc_projects.findFirst({
      where: {
        id: args.projectId,
      },
    });
    if (!projectMeta) {
      await removeFromBlobAndDB(attachmentObj);
      return {
        code: 400,
        message: "Project does not exist",
      };
    }
    const city = await prisma.dc_cities.findFirst({
      where: { id: projectMeta?.cityid },
    });
    if (!city) {
      throw new HttpError(400, "City not found in project");
    }
    const customerMeta = await prisma.dc_customer.findFirst({
      where: {
        customerid: projectMeta?.customerid,
      },
    });
    if (!customerMeta) {
      await removeFromBlobAndDB(attachmentObj);
      return {
        code: 400,
        message: "Customer does not exist",
      };
    }
    const firstName = customerMeta?.firstname ? customerMeta.firstname : "";
    const lastname = customerMeta?.lastname ? customerMeta.lastname : "";
    const customerName = `${firstName} ${lastname}`;
    if (customerName && clientName !== customerName.trim()) {
      await removeFromBlobAndDB(attachmentObj);
      return {
        code: 400,
        message: "Customer name did not match. Please upload appropriate file.",
      };
    }
    const updateQuoteProps = await prisma.dc_project_quotes.findFirst({
      where: {
        id: projectMeta.quoteid,
      },
    });
    if (!updateQuoteProps) {
      await removeFromBlobAndDB(attachmentObj);
      return {
        code: 400,
        message: "Quote does not exist",
      };
    }
    const updateQuotePropsObj = {};
    // Allow all rooms with if exists conditional check.
    const roomName = roomsArr[0];
    const roomList = (updateQuoteProps.roomlist as Prisma.JsonArray) || [];
    if (roomList.length !== 0) {
      roomList.forEach((element: any) => {
        if (
          roomName.toLowerCase() === element.roomName.toLowerCase() ||
          (SITE_SERVICE.includes(roomName.toLowerCase()) &&
            SITE_SERVICE.includes(element.roomName.toLowerCase()))
        ) {
          throw new HttpError(
            400,
            "Oops! room name already exists. Please delete existing room to add new."
          );
        }
      });
    }
    // roomsList Object with names, prices and metadata
    _commonRoomList = getRoomListArrayFromXmlData(mainObj, _commonRoomList);
    let roomElement = [],
      roomsIds = [];
    if (roomList.length !== 0) {
      roomElement = roomList;
    }
    if (!roomList.includes(roomName)) {
      roomElement.push(_commonRoomList[0]);
    }
    const roomObj = {
      [roomName]: attachmentObj.location,
    };
    roomsIds = updateQuoteProps.rooms_ids
      ? (updateQuoteProps.rooms_ids as Prisma.JsonArray)
      : [];
    roomsIds.push(roomObj);
    updateQuotePropsObj["rooms_ids"] = roomsIds;
    updateQuotePropsObj["roomlist"] = roomElement;
    let sumModular = 0,
      sumSite = 0;
    roomElement.forEach((element) => {
      if (!SITE_SERVICE.includes(element.roomName.toLowerCase())) {
        sumModular += +element.roomPrice;
      } else {
        sumSite += +element.roomPrice;
      }
    });
    if (SITE_SERVICE.includes(roomName.toLowerCase())) {
      sumSite = parseInt(commonAmount);
    }
    updateQuotePropsObj["modularvalue"] = sumModular;
    updateQuotePropsObj["siteservice"] = sumSite;
    const updatedResponse = await prisma.dc_project_quotes.update({
      where: { id: updateQuoteProps.id },
      data: updateQuotePropsObj,
    });
    const responseObj: any = {};
    const projectMetaObj = {};
    let pmFeeModular = 0,
      pmFeeSite = 0,
      siteFinal = 0,
      modularFinal = 0;
    if (!SITE_SERVICE.includes(roomName.toLowerCase()) || sumModular) {
      const absoluteDiscount = updatedResponse.modularabsolutediscount || 0;
      const discountAmount =
        (sumModular * +updatedResponse.modulardiscount) / 100;
      let afterDiscount = sumModular - discountAmount - absoluteDiscount;
      if (city) {
        if (city.includepmfee && projectMeta.includepmfee) {
          pmFeeModular = (updatedResponse.modularvalue * 7) / 100;
          projectMetaObj["modularpmfee"] = pmFeeModular;
          afterDiscount += pmFeeModular;
        }
      }
      const gst = (afterDiscount * 18) / 100;
      const finalTotal = afterDiscount + +gst;
      modularFinal = finalTotal;
      projectMetaObj["projectmodularvalue"] =
        parseFloat(finalTotal.toFixed(2)) || 0;
      projectMetaObj["modulardiscount"] = updatedResponse.modulardiscount || 0;
      projectMetaObj["modularbaseamount"] =
        parseFloat(sumModular.toFixed(2)) || 0;
      responseObj.modularValue = responseObj.modularBaseAmount =
        parseFloat(sumModular.toFixed(2)) || 0;
      projectMetaObj["modularabsolutediscount"] = absoluteDiscount;
      responseObj.modularTotalTax = parseFloat(gst.toFixed(2)) || 0;
      responseObj.modularTotalAmount = parseFloat(finalTotal.toFixed(2)) || 0;
      responseObj.modularDiscountedAmount =
        parseFloat(discountAmount.toFixed(2)) || 0;
      responseObj.attachment = attachmentObj.location;
      responseObj.filekey = attachmentObj.filekey;
      responseObj.customerName = clientName;
      responseObj.modularDiscountValue = updatedResponse.modulardiscount || 0;
      responseObj.modularFixedDiscount = absoluteDiscount;
    }
    if (SITE_SERVICE.includes(roomName.toLowerCase()) || sumSite) {
      const absoluteDiscount = updatedResponse.siteserviceabsolutediscount || 0;
      const discountAmount =
        (sumSite * +updatedResponse.siteservicediscount) / 100;
      let afterDiscount = sumSite - discountAmount - absoluteDiscount;
      if (city) {
        if (city.includepmfee && projectMeta.includepmfee) {
          pmFeeSite = (updatedResponse.siteservice * 7) / 100;
          projectMetaObj["sitepmfee"] = pmFeeSite;
          afterDiscount += pmFeeSite;
        }
      }
      const gst = (afterDiscount * 18) / 100;
      const finalTotal = afterDiscount + +gst;
      siteFinal = finalTotal;
      console.log(finalTotal);
      projectMetaObj["projectsiteservicesvalue"] =
        parseFloat(finalTotal.toFixed(2)) || 0;
      projectMetaObj["siteservicediscount"] =
        updatedResponse.siteservicediscount || 0;
      projectMetaObj["siteservicebaseamount"] =
        parseFloat(sumSite.toFixed(2)) || 0;
      responseObj.siteServiceValue = responseObj.siteServiceBaseAmount =
        parseFloat(sumSite.toFixed(2)) || 0;
      projectMetaObj["siteserviceabsolutediscount"] = absoluteDiscount;
      responseObj.siteServiceTotalTax = parseFloat(gst.toFixed(2)) || 0;
      responseObj.siteServiceTotalAmount =
        parseFloat(finalTotal.toFixed(2)) || 0;
      responseObj.siteServiceDiscountedAmount =
        parseFloat(discountAmount.toFixed(2)) || 0;
      responseObj.attachment = attachmentObj.location;
      responseObj.filekey = attachmentObj.filekey;
      responseObj.customerName = clientName;
      responseObj.siteServiceDiscountValue =
        updatedResponse.siteservicediscount || 0;
      responseObj.siteServiceFixedDiscount = absoluteDiscount;
    }
    projectMetaObj["totalprojectvalue"] = modularFinal + siteFinal;
    projectMetaObj["achievedrevenuevalue"] =
      projectMeta.modular_collected_amount +
      projectMeta.site_services_collected_amount;
    projectMetaObj["pendingamountvalue"] =
      modularFinal +
      siteFinal -
      projectMeta.modular_collected_amount +
      projectMeta.site_services_collected_amount;
    const updatedProjectMeta = await prisma.dc_projects.update({
      where: {
        id: args.projectId,
      },
      data: projectMetaObj,
    });
    responseObj.totalProjectValue = updatedProjectMeta.totalprojectvalue;
    responseObj.achievedRevenueValue = updatedProjectMeta.achievedrevenuevalue;
    responseObj.pendingAmountValue = updatedProjectMeta.pendingamountvalue;

    return {
      code: 200,
      message: "Success",
      data: responseObj,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// funcitons:
//#region remove from Blob and DBS
const removeFromBlobAndDB = async (attachmentObj) => {
  if (attachmentObj) {
    const attachmentFileKey = attachmentObj.filekey;
    const awsDeleteRes = await deleteBlob(attachmentFileKey);
    if (awsDeleteRes) {
      await prisma.dc_attachments.delete({
        where: { id: attachmentObj.id },
      });
    }
  }
};
//#endregion
