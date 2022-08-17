import { prisma } from "../../../prismaConfig";
import { create as storageService } from "../../../core/fileStorageServices/AwsStorage";
import Parse from "xml-js";
import * as jsforce from "jsforce";
import superagent from "superagent";
import HttpError from "standard-http-error";
import NotificationServices from "../../../domain/services/notification/NotificationService";

export async function getConnection(): Promise<any> {
  var conn = new jsforce.Connection({
    loginUrl: process.env.salesforceLoginUrl,
  });
  await conn.login(
    process.env.salesforceEmail,
    process.env.salesforcePassword,
    function (err, _userInfo) {
      console.log(err, "error");
      console.log(conn.accessToken, "ssss");
    }
  );
  return conn;
}

export async function UploadFileOnS3(attachment) {
  const key = attachment.key;
  const fileObj = await storageService({
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey,
    region: process.env.awsRegion,
    bucket: process.env.awsBucket,
  }).uploadDocumentBuffer(key, attachment.contentType, attachment.base64);
  const attachmentObj: {
    filekey: string;
    location: string;
    contenttype: string;
    user?: number;
    customer?: number;
    ispreorpost?: number;
    momid?: number;
    commentid?: number;
    leadid?: string;
    opportunityid?: string;
    displayname?: string;
    created_at?: Date;
  } = {
    filekey: key,
    location: fileObj.Location,
    contenttype: attachment.contentType,
    customer: attachment.customerid,
    user: attachment.userid,
    ispreorpost: attachment.ispreorpost,
    leadid: attachment.leadid,
    opportunityid: attachment.opportunityid,
    momid: attachment.momid,
    commentid: attachment.commentid,
    displayname: attachment.displayname,
    created_at: new Date(),
  };

  console.log(234, attachmentObj);

  const saveToDb = await prisma.dc_attachments.upsert({
    where: {
      location: attachmentObj.location,
    },
    update: attachmentObj,
    create: attachmentObj,
  });
  console.log(saveToDb);
  return saveToDb;
}
export const triggerEmailNotification = async (to, subject, content, cc,attachments = null) => {
  content = content.replace(/(\r\n|\r|\n)/g, "<br>");
  const notificationService = new NotificationServices();
  return notificationService.sendEmail(
    null,
    to,
    subject,
    content,
    cc,
    null,
    attachments
  );
};

export const deleteBlob = async (keys) => {
  return storageService({
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey,
    region: process.env.awsRegion,
    bucket: process.env.awsBucket,
  }).deleteFromAws(keys);
};

export async function getBuffer(key) {
  return storageService({
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey,
    region: process.env.awsRegion,
    bucket: process.env.awsBucket,
  }).getBuffer(key);
}

export async function getUrlToUpload(key, signedUrlExpireTime, contentType) {
  return storageService({
    accessKeyId: process.env.awsAccessKeyId,
    secretAccessKey: process.env.awsSecretAccessKey,
    region: process.env.awsRegion,
    bucket: process.env.awsBucket,
  }).getFileUrlToUpload(key, signedUrlExpireTime, contentType);
}

//#region roomList Object Create.
//#region Get room Names
export function getRoomNames(builderList) {
  try {
    const roomsArr = [];
    let count = 1;
    let roomNameObj;
    let roomNameFromSplit;
    let _list = [];
    if (!Array.isArray(builderList)) {
      _list.push(builderList);
    } else {
      _list = builderList;
    }
    _list.forEach((element) => {
      if (count === Math.floor(element.hierarchicalPos._text)) {
        roomNameFromSplit = element.PVarString._text.split("ROOMNAME:=");
        if (!roomNameFromSplit[1]) {
          throw new HttpError(
            400,
            "Room name not found. Please upload appropriate Xml!"
          );
        }
        roomNameObj = roomNameFromSplit[1];
        roomsArr.push(roomNameObj);
        count++;
      }
    });
    return roomsArr;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
//#endregion

// generate roomList from xml data.
export function getRoomListArrayFromXmlData(xmlJsonObj, roomList) {
  try {
    const builderList = xmlJsonObj.XML.Order.BuilderList.Set;
    let _list = [];
    if (!Array.isArray(builderList)) {
      _list.push(builderList);
    } else {
      _list = builderList;
    }
    let roomsArr = [];
    roomsArr = getRoomNames(_list);
    roomList = addRoomNamesAndReturnRoomList(roomList, roomsArr);
    roomList = addComponentDataToRoomListAndReturn(roomList, _list);
    return roomList;
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error);
  }
}

// Adding roomnames to RoomList array.
export function addRoomNamesAndReturnRoomList(roomList, roomsArr) {
  try {
    let obj;
    for (const room of roomsArr) {
      obj = {
        custRoomName: "",
        roomPrice: "",
        roomCost: "",
        compData: [],
        roomName: "",
        totalQuantity: "",
      };
      obj.custRoomName = room;
      obj.roomName = room;
      roomList.push(obj);
    }
    return roomList;
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error);
  }
}

// Adding component Meta data for each room in roomList.
export function addComponentDataToRoomListAndReturn(roomList, compSet) {
  try {
    let compObj;
    roomList.forEach((room, index) => {
      let price = 0,
        totalQuantity = 0;
      compSet.forEach((comp) => {
        compObj = {
          componentCost: 0,
          description: "",
          componentName: "",
          componentImage: "",
          componentIndex: "",
          quantity: 0,
          totalCompCost: 0,
        };
        if (Math.floor(comp.hierarchicalPos._text) === index + 1) {
          compObj.componentIndex = comp.hierarchicalPos._text;
          compObj.componentCost = +comp.ARTICLE_PRICE_INFO1._text;
          compObj.componentName = comp.ARTICLE_TEXT_INFO1._text;
          compObj.description = comp.ARTICLE_TEXT_INFO2._text;
          compObj.componentImage = comp.ARTICLE_IMAGE._text
            ? comp.ARTICLE_IMAGE._text
            : "";
          compObj.quantity = +comp.Count._text;
          compObj.totalCompCost = +compObj.quantity * +compObj.componentCost;
          room.compData.push(compObj);
          price += +compObj.totalCompCost;
          totalQuantity += compObj.quantity;
          return;
        }
      });
      room.roomPrice = price.toFixed(2);
      room.roomCost = price.toFixed(2);
      room.totalQuantity = totalQuantity;
    });
    return roomList;
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error);
  }
}
//#endregion

//#region XMLToPDF
export async function XmlToPdf(xmlObj) {
  try {
    const {
      from,
      file,
      type,
      discount,
      customerId,
      absoluteDiscount,
      opportunityId,
      isPmFeeIncluded,
      cityPmFee,
      leadid,
      displayname,
    } = xmlObj;
    let pdfName;
    const attachmentObj = await prisma.dc_attachments.findFirst({
      where: {
        location: file,
      },
    });
    if (!attachmentObj) {
      throw new HttpError(400, "Attachment not found");
    }
    let _commonRoomList = [];
    const xml: any = await getBuffer(attachmentObj.filekey);
    const result = await Parse.xml2json(xml, {
      compact: true,
      spaces: 4,
    });
    const mainObj = JSON.parse(result);
    // modular/siteService
    const clientName = mainObj.XML.Order.Head.CONTACT_ADDRESS1._text;
    // modular/siteService fixed Discount
    const absoluteDiscountVal =
      from === "Sales Force"
        ? absoluteDiscount
        : parseInt(mainObj.XML.Order.Head.CUSTOM_INFO5._text);
    // Populating data for modular response
    const quote = await prisma.quote.findMany({
      where: { opportunityid: opportunityId },
    });
    const count = quote?.length;
    if (type === "modularXml") {
      pdfName = `${customerId}_${clientName}(${count})modular_myQuote.pdf`;
    }
    // Populating data for modular response
    else if (type === "siteServiceXml") {
      pdfName = `${customerId}_${clientName}(${count})site_myQuote.pdf`;
    }
    // roomsList Object with names, prices and metadata
    _commonRoomList = getRoomListArrayFromXmlData(mainObj, _commonRoomList);
    // generate pdf in base64 & upload to blob.
    const Obj = {
      pdfName,
      leadId: leadid,
      displayName: displayname,
      parsedData: mainObj,
      roomsArray: _commonRoomList,
      discount: discount,
      absoluteDiscount: absoluteDiscountVal || 0,
      opportunityId,
      isPmFeeIncluded,
      cityPmFee,
      clientOrProjectName: clientName,
    };
    // generate pdf in base64 & upload to blob.
    const response = await superagent
      .put(`${process.env.PDFGENERATE}/generateProposalPdf`)
      .send(Obj)
      .timeout(180000)
      .set("Content-Type", "application/json");
    return {
      roomList: _commonRoomList,
      s3Location: response?._body?.data?.Location,
      clientName: clientName,
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error);
  }
}
//#endregion

export const uploadFloorPlanAtSalesForce = async (body) => {
  try {
    const url = `${process.env.floorPlanSFUrl}/Floorplan`;
    const res = await superagent
      .post(url)
      .send(body)
      .set("Content-Type", "application/json");
    return res?.body;
  } catch (error) {
    console.log(error);
    throw new HttpError(400, error);
  }
};
