import { UploadFileOnS3 } from "../../../../domain/services/baseUseCase/baseUseCase";
import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";
import { v4 as uuidv4 } from "uuid";
import HttpError from "standard-http-error";

export const proposalSignedUrl = async (_root, args, _context) => {
  try {
    let user;
    try {
      user = await authenticate(_context, "DD");
    } catch (error) {
      throw new HttpError(401, error);
    }
    const id = uuidv4();
    const filekey = `proposal/${id}_${args.key}`;
    const responseObj: any = {};
    responseObj.key = args.key;
    responseObj.contentType = args.contentType;
    responseObj.awsFileKey = filekey;
    const attachmentObj = {
      key: filekey,
      contentType: args.contentType,
      base64: args.base64,
      userid: user.userid,
      ispreorpost: 0,
      leadid: args.leadid,
    };
    const toS3 = await UploadFileOnS3(attachmentObj);
    responseObj.fileLocation = toS3.location;
    responseObj.id = toS3.id;
    return {
      code: 200,
      message: "Success",
      data: responseObj,
    };
  } catch (error) {
    console.log("error ======> ", error);
    throw error;
  }
};
