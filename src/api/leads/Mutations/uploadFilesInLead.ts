import { UploadFileOnS3 } from "../../../domain/services/baseUseCase/baseUseCase";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";

export const uploadFilesInLeads = async (root, args, context) => {
  let uploadFilesResponseObj;

  try {
    const user = await authenticate(context, "DD");
    const { leadid, opportunityid, base64, filekey, contentType } = args;
    const attachment = {
      key: filekey,
      contentType,
      base64,
      userid: user.userid,
      ispreorpost: 0,
      leadid: leadid,
      opportunityid: opportunityid,
    };
    const toS3 = await UploadFileOnS3(attachment);
    let responseObj = {
      filename: filekey,
      Content_Type: contentType,
      data: toS3.location,
    };

    uploadFilesResponseObj = {
      code: 200,
      message: "success",
      data: responseObj,
    };
    return uploadFilesResponseObj;
  } catch (error) {
    uploadFilesResponseObj = { code: 200, message: error.message };
    return uploadFilesResponseObj;
  }
};
