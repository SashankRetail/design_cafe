import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { UploadFileOnS3 } from "../../../domain/services/baseUseCase/baseUseCase"

export const getFileUrl = async (root, args, context) => {
    let FileUrlResponseObj;
    try {
        const user = await authenticate(context, "DD")
        const { attachment } = args

        const attachmentFile = {
            key: attachment.filename,
            contentType: attachment.Content_Type,
            base64: attachment.base64,
            userid: user.userid,
            ispreorpost: 1,
        };
       const  toS3 = await UploadFileOnS3(attachmentFile);

        attachment.base64 = toS3.location;
        FileUrlResponseObj = { code: 200, message: "success", data: toS3 }
        return FileUrlResponseObj;
    } catch (error) {
        FileUrlResponseObj = { code: 400, message: error.message }
        return FileUrlResponseObj;
    }
}
