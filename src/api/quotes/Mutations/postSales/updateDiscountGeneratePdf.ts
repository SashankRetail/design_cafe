import { prisma } from "../../../../prismaConfig";
import Parse from "xml-js";
import HttpError from "standard-http-error";
import { SITE_SERVICE } from "../../../../domain/enumerations/RoomTypesEnums";
import { getBuffer } from "../../../../domain/services/baseUseCase/baseUseCase";
import { Prisma } from "@prisma/client";
import superagent from "superagent";
import { addPdfToMilestone } from "../commonFunctions";

export const updateDiscountGeneratePdf = async (_root, args, _context) => {
  try {
    // find project & customer meta data
    const projectMeta = await prisma.dc_projects.findFirst({
      where: {
        id: args.projectId,
      },
    });
    if (!projectMeta) {
      return {
        code: 400,
        message: "Project does not exist",
      };
    }
    const projectMetaObj = {};
    const resp = await prisma.dc_project_quotes.findFirst({
      where: { id: projectMeta.quoteid },
    });
    if (!resp) {
      return {
        code: 400,
        message: "Quote does not exist",
      };
    }
    const respObj = {};
    const roomIds = (resp.rooms_ids as Prisma.JsonArray) || [];
    if (roomIds.length === 0) {
      return {
        code: 400,
        message: "Please upload xml to generate pdf",
      };
    }
    const attachmentKey = Object.keys(roomIds[0])[0];
    const attachmentVal = Object.values(roomIds[0])[0];
    if (!attachmentKey) {
      return {
        code: 400,
        message: "Please upload xml to generate pdf",
      };
    }
    const attachmentObj = await prisma.dc_attachments.findFirst({
      where: {
        location: attachmentVal,
      },
    });
    if (!attachmentObj) {
      return {
        code: 400,
        message: "Attachment not found",
      };
    }
    const customerMeta = await prisma.dc_customer.findFirst({
      where: {
        customerid: projectMeta.customerid,
      },
    });
    if (!customerMeta) {
      return {
        code: 400,
        message: "Customer does not exist",
      };
    }
    const xml: any = await getBuffer(attachmentObj.filekey);
    const result = await Parse.xml2json(xml, { compact: true, spaces: 4 });
    const mainObj = JSON.parse(result);
    // generate pdf Name
    const clientId = projectMeta.clientid || projectMeta.projectid;
    const customerName = mainObj.XML.Order.Head.CONTACT_ADDRESS1._text
      ? mainObj.XML.Order.Head.CONTACT_ADDRESS1._text
      : customerMeta.firstname.trim() + customerMeta.lastname.trim();
    const pdfName = `${clientId}_${customerName}`;
    let _sitePdf,
      _roomsPdf,
      pmFeeModular = 0,
      pmFeeSite = 0,
      siteFinal = 0,
      modularFinal = 0;
    /**************************************************************************
    Logic should be added for esignoff and projectfiles after project management
    and designsign off implementation
    ***************************************************************************/

    const city = await prisma.dc_cities.findFirst({
      where: { id: projectMeta?.cityid },
    });
    if (!city) {
      throw new HttpError(400, "City not found in project");
    }
    // Populating data for site service xml.
    if (
      resp.siteservice &&
      resp.siteservice !== 0 &&
      (args.siteServiceDiscount || args.siteServiceDiscount === 0)
    ) {
      const absoluteDiscount = resp.siteserviceabsolutediscount || 0;
      respObj["siteservicediscount"] = args.siteServiceDiscount;
      const discountAmount =
        (resp.siteservice * args.siteServiceDiscount) / 100;
      let afterDiscount = resp.siteservice - discountAmount - absoluteDiscount;
      if (city.includepmfee && projectMeta.includepmfee) {
        pmFeeSite = (resp.siteservice * 7) / 100;
        projectMetaObj["sitepmfee"] = pmFeeSite;
        afterDiscount += pmFeeSite;
      }
      const gst = (afterDiscount * 18) / 100;
      const finalTotal = afterDiscount + +gst;
      siteFinal = finalTotal;
      projectMetaObj["siteservicediscount"] = args.siteServiceDiscount;
      projectMetaObj["projectsiteservicesvalue"] =
        parseFloat(finalTotal.toFixed(2)) || 0;
      projectMetaObj["siteserviceabsolutediscount"] = absoluteDiscount;
      const _siteRoom = [],
        _siteName = `${pdfName}site_myQuote.pdf`,
        roomlist = (resp.roomlist as Prisma.JsonArray) || [];
      roomlist.forEach((element: any) => {
        if (SITE_SERVICE.includes(element.roomName.toLowerCase())) {
          _siteRoom.push(element);
        }
      });
      const siteServiceXmlObj = {
        pdfName: _siteName,
        projectId: projectMeta.id,
        parsedData: mainObj,
        roomsArray: _siteRoom,
        discount: args.siteServiceDiscount || 0,
        absoluteDiscount: absoluteDiscount || 0,
        opportunityId: args.opportunityId,
        isPmFeeIncluded: projectMeta.includepmfee,
        cityPmFee: city.includepmfee,
        clientOrProjectName: projectMeta.projectname,
      };
      _sitePdf = await XmlToPdf(siteServiceXmlObj);
      respObj["siteservicepdflocation"] = projectMetaObj["siteservicepdflink"] =
        _sitePdf.s3Location;
      const urlIntoMilestone = {
        filekey: _siteName,
        location: _sitePdf.s3Location,
        contenttype: "application/pdf",
      };
      addPdfToMilestone(
        projectMeta,
        "Site Services Quotation",
        urlIntoMilestone
      );
    }

    // Populating data for all modular xmls.
    if (
      resp.modularvalue &&
      resp.modularvalue !== 0 &&
      (args.modularDiscount || args.modularDiscount === 0)
    ) {
      const absoluteDiscount = resp.modularabsolutediscount || 0;
      respObj["modulardiscount"] = args.modularDiscount || 0;
      const discountAmount = (resp.modularvalue * args.modularDiscount) / 100;
      let afterDiscount = resp.modularvalue - discountAmount - absoluteDiscount;
      if (city.includepmfee && projectMeta.includepmfee) {
        pmFeeModular = (resp.modularvalue * 7) / 100;
        projectMetaObj["modularpmfee"] = pmFeeModular;
        afterDiscount += pmFeeModular;
      }
      const gst = (afterDiscount * 18) / 100;
      const finalTotal = afterDiscount + +gst;
      modularFinal = finalTotal;
      projectMetaObj["modulardiscount"] = args.modularDiscount || 0;
      projectMetaObj["projectmodularvalue"] =
        parseFloat(finalTotal.toFixed(2)) || 0;
      projectMetaObj["modularabsolutediscount"] = absoluteDiscount;
      const _roomList = [],
        roomslist = (resp.roomlist as Prisma.JsonArray) || [],
        _modularName = `${pdfName}modular_myQuote.pdf`;
      roomslist.forEach((element: any) => {
        if (!SITE_SERVICE.includes(element.roomName.toLowerCase())) {
          _roomList.push(element);
        }
      });
      const modularXmlObj = {
        pdfName: _modularName,
        parsedData: mainObj,
        projectId: projectMeta.id,
        roomsArray: _roomList,
        discount: args.modularDiscount || 0,
        name: _modularName,
        absoluteDiscount: absoluteDiscount || 0,
        opportunityId: args.opportunityId,
        isPmFeeIncluded: projectMeta.includepmfee,
        cityPmFee: city.includepmfee,
        clientOrProjectName: projectMeta.projectname,
      };
      _roomsPdf = await XmlToPdf(modularXmlObj);
      respObj["modularpdflocation"] = projectMetaObj["quotelink"] =
        _roomsPdf.s3Location;
      const urlIntoMilestone = {
        filekey: _modularName,
        location: _roomsPdf.s3Location,
        contenttype: "application/pdf",
      };
      addPdfToMilestone(projectMeta, "Modular Quotation", urlIntoMilestone);
    }
    projectMetaObj["totalprojectvalue"] = modularFinal + siteFinal;
    const savedProjectData = await prisma.dc_projects.update({
      where: { id: args.projectId },
      data: projectMetaObj,
    });

    const quoteResponse = await prisma.dc_project_quotes.update({
      where: { id: projectMeta.quoteid },
      data: respObj,
    });
    const response = {
      projectModularValue: savedProjectData?.projectmodularvalue || 0,
      projectSiteServicesValue: savedProjectData?.projectsiteservicesvalue || 0,
      totalProjectValue: parseFloat((modularFinal + siteFinal).toFixed(2)),
      achievedRevenue: parseFloat(
        savedProjectData.achievedrevenuevalue.toFixed(2)
      ),
      pendingAmount: parseFloat(savedProjectData.pendingamountvalue.toFixed(2)),
      isImosProject: true,
      id: projectMeta?.id,
      modularDiscount: args.modularDiscount || 0,
      civilDiscount: args.siteServiceDiscount || 0,
      modularPdfLocation: quoteResponse?.modularpdflocation
        ? quoteResponse?.modularpdflocation
        : "",
      siteServicePdfLocation: quoteResponse?.siteservicepdflocation
        ? quoteResponse?.siteservicepdflocation
        : "",
    };
    return {
      code: 200,
      message: "Project details updated successfully!",
      data: response,
    };

    //#region xmltopdf
    async function XmlToPdf(xmlObj) {
      // generate pdf in base64 & upload to blob.
      const { roomsArray } = xmlObj;
      const data = await superagent
        .put(`${process.env.PDFGENERATE}/generateProposalPdf`)
        .send(xmlObj)
        .timeout(180000)
        .set("Content-Type", "application/json");
      return {
        roomList: roomsArray,
        s3Location: data?._body?.data?.Location,
      };
    }
    //#endregion
  } catch (error) {
    console.log(error);
    throw error;
  }
};
