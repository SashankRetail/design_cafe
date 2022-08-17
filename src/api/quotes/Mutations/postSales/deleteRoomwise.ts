import { prisma } from "../../../../prismaConfig";
import { SITE_SERVICE } from "../../../../domain/enumerations/RoomTypesEnums";
import HttpError from "standard-http-error";
import { deleteBlob } from "../../../../domain/services/baseUseCase/baseUseCase";
import { Prisma } from "@prisma/client";
export const deleteRoomwise = async (_root, args, _context) => {
  try {
    const roomName: any = args.roomType;
    const quoteData = await prisma.dc_project_quotes.findFirst({
      where: {
        id: args.ddQuoteId,
      },
    });
    if (!quoteData) {
      return {
        code: 400,
        message: "Quote does not exist",
      };
    }

    const quoteDataObj = {};
    const projectMeta = await prisma.dc_projects.findFirst({
      where: {
        quoteid: args.ddQuoteId,
      },
    });
    if (!projectMeta) {
      return {
        code: 400,
        message: "Project not found",
      };
    }
    const city = await prisma.dc_cities.findFirst({
      where: { id: projectMeta?.cityid },
    });
    if (!city) {
      throw new HttpError(400, "City not found in project");
    }
    const projectMetaObj = {};
    const customerMeta = await prisma.dc_customer.findFirst({
      where: {
        customerid: projectMeta.customerid,
      },
    });
    if (!customerMeta) {
      return {
        code: 400,
        message: "Customer not found",
      };
    }

    const arrayRemoveRoom = [];
    const _roomList = (quoteData.roomlist as Prisma.JsonArray) || [];
    if (_roomList.length === 0) {
      return {
        code: 400,
        message: "Room doesn't exist",
      };
    }
    let roomsExist = [];
    _roomList.forEach((element: any) => {
      roomsExist.push(element.roomName);
    });
    if (roomsExist.includes(roomName)) {
      _roomList.forEach((element: any) => {
        if (element.roomName !== roomName) {
          arrayRemoveRoom.push(element);
        }
      });
    } else {
      return {
        code: 400,
        message: "Room doesn't exist",
      };
    }
    let roomXmlVal;
    const deleteArray = [],
      roomsIds = (quoteData.rooms_ids as Prisma.JsonArray) || [];
    if (roomsIds.length !== 0) {
      for (let i = roomsIds.length - 1; i >= 0; i--) {
        if (
          Object.keys(roomsIds[i])[0].toLowerCase() !== roomName.toLowerCase()
        ) {
          deleteArray.push(roomsIds[i]);
        } else {
          roomXmlVal = Object.values(roomsIds[i])[0];
        }
      }
      quoteDataObj["rooms_ids"] = deleteArray;
    } else {
      quoteDataObj["rooms_ids"] = [];
    }
    quoteDataObj["roomlist"] = arrayRemoveRoom;
    const currentQuoteVal = await prisma.dc_project_quotes.update({
      where: {
        id: args.ddQuoteId,
      },
      data: quoteDataObj,
    });
    const currentQuoteValObj = {};
    let sumModular = 0,
      sumSite = 0,
      roomElement = [];
    const roomsList = (currentQuoteVal.roomlist as Prisma.JsonArray) || [];
    if (roomsList.length !== 0) {
      roomElement = roomsList;
      roomElement.forEach((element: any) => {
        if (!SITE_SERVICE.includes(element.roomName.toLowerCase())) {
          sumModular += +element.roomPrice;
        } else {
          sumSite += +element.roomPrice;
        }
      });
    }
    currentQuoteValObj["modularvalue"] = sumModular;
    currentQuoteValObj["siteservice"] = sumSite;
    if (sumModular === 0) {
      currentQuoteValObj["modulardiscount"] = projectMetaObj[
        "modulardiscount"
      ] = 0;
    } else if (sumSite === 0) {
      currentQuoteValObj["siteservicediscount"] = projectMetaObj[
        "siteservicediscount"
      ] = 0;
    }
    const responseObj: any = {};
    let pmFeeModular = 0,
      pmFeeSite = 0,
      siteFinal = 0,
      modularFinal = 0;
    if (!SITE_SERVICE.includes(roomName.toLowerCase()) || sumModular) {
      const absoluteDiscount = currentQuoteVal.modularabsolutediscount || 0;
      const discountAmount =
        (sumModular * currentQuoteVal.modulardiscount) / 100;
      let afterDiscount = sumModular - discountAmount - absoluteDiscount;
      if (city) {
        if (city.includepmfee && projectMeta.includepmfee) {
          pmFeeModular = (currentQuoteVal.modularvalue * 7) / 100;
          projectMetaObj["modularpmfee"] = pmFeeModular;
          afterDiscount += pmFeeModular;
        }
      }
      const gst = (afterDiscount * 18) / 100;
      const finalTotal = afterDiscount + +gst;
      modularFinal = finalTotal;
      projectMetaObj["projectmodularvalue"] =
        parseFloat(finalTotal.toFixed(2)) || 0;
      projectMetaObj["modularbaseamount"] =
        responseObj.modularValue =
        responseObj.modularBaseAmount =
          parseFloat(sumModular.toFixed(2)) || 0;
      responseObj.modularTotalTax = parseFloat(gst.toFixed(2)) || 0;
      responseObj.modularTotalAmount = parseFloat(finalTotal.toFixed(2)) || 0;
      responseObj.modularDiscountedAmount =
        parseFloat(discountAmount.toFixed(2)) || 0;
      responseObj.modularDiscountValue = currentQuoteVal.modulardiscount || 0;
    }
    if (SITE_SERVICE.includes(roomName.toLowerCase()) || sumSite) {
      const absoluteDiscount = currentQuoteVal.siteserviceabsolutediscount || 0;
      const discountAmount =
        (sumSite * currentQuoteVal.siteservicediscount) / 100;
      let afterDiscount = sumSite - discountAmount - absoluteDiscount;
      if (city) {
        if (city.includepmfee && projectMeta.includepmfee) {
          pmFeeSite = (currentQuoteVal.siteservice * 7) / 100;
          projectMetaObj["sitepmfee"] = pmFeeSite;
          afterDiscount += pmFeeSite;
        }
      }
      const gst = (afterDiscount * 18) / 100;
      const finalTotal = afterDiscount + +gst;
      siteFinal = finalTotal;
      projectMetaObj["projectsiteservicesvalue"] =
        parseFloat(finalTotal.toFixed(2)) || 0;
      projectMetaObj["siteservicebaseamount"] =
        responseObj.siteServiceValue =
        responseObj.siteServiceBaseAmount =
          parseFloat(sumSite.toFixed(2)) || 0;
      responseObj.siteServiceTotalTax = parseFloat(gst.toFixed(2)) || 0;
      responseObj.siteServiceTotalAmount =
        parseFloat(finalTotal.toFixed(2)) || 0;
      responseObj.siteServiceDiscountedAmount =
        parseFloat(discountAmount.toFixed(2)) || 0;
      responseObj.siteServiceDiscountValue =
        currentQuoteVal.siteservicediscount || 0;
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
      where: { id: projectMeta.id },
      data: projectMetaObj,
    });
    responseObj.totalProjectValue = updatedProjectMeta.totalprojectvalue;
    responseObj.achievedRevenueValue = updatedProjectMeta.achievedrevenuevalue;
    responseObj.pendingAmountValue = updatedProjectMeta.pendingamountvalue;

    const updatedQuoteData = await prisma.dc_project_quotes.update({
      where: { id: args.ddQuoteId },
      data: currentQuoteValObj,
    });
    const roomIds = (updatedQuoteData.rooms_ids as Prisma.JsonArray) || [];
    // remove files from attachments & s3 which are added in postsales.
    if (roomIds.length !== 0 && roomXmlVal) {
      const attachmentObj = await prisma.dc_attachments.findFirst({
        where: {
          location: roomXmlVal,
        },
      });
      removeFromBlobAndDB(attachmentObj);
    }
    if (SITE_SERVICE.includes(roomName.toLowerCase())) {
      // quoteId, location, projectId, key, name
      await removePdfFilesFromSchemas(
        args.ddQuoteId,
        "siteservicexml",
        projectMeta.id,
        "siteservicePdf",
        "Addon Costing"
      );
    } else {
      // quoteId, location, projectId,  key, name
      await removePdfFilesFromSchemas(
        args.ddQuoteId,
        "modularxml",
        projectMeta.id,
        "modularPdf",
        "Latest BOQ"
      );
    }
    return {
      code: updatedQuoteData ? 200 : 400,
      message: updatedQuoteData
        ? "Room deleted successfully"
        : "Room does not exist",
      data: updatedQuoteData ? responseObj : "",
    };
    // remove pdf files from ProjectFiles, EsignOff, Quote
    async function removePdfFilesFromSchemas(
      quoteId,
      location,
      _projectId?,
      _key?,
      _name?
    ) {
      // removing pdf locations & keys from quote
      await prisma.dc_project_quotes.update({
        where: {
          id: quoteId,
        },
        data: {
          [location]: null,
        },
      });
      /*****************************************************
      Logic Needs to be added
      after Project management and design signoff complete
      *******************************************************/
    }
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error);
  }
};
const removeFromBlobAndDB = async (attachmentObj) => {
  if (attachmentObj) {
    const attachmentFileKey = attachmentObj.filekey;
    const awsDeleteRes = await deleteBlob(attachmentFileKey);
    console.log("awsDeleteRes ====> ", awsDeleteRes);
    if (awsDeleteRes) {
      await prisma.dc_attachments.delete({
        where: { id: attachmentObj.id },
      });
    }
  }
};
