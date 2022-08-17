import { UploadFileOnS3 } from "../../../domain/services/baseUseCase/baseUseCase"
export const uploadLeadFiles = async (root, args, context) => {
    let uploadFilesResponseObj;

    try {
        const { leadAttachment,leadid ,opportunityid} = args;
        let toS3;
        const responseArr: any[] = [];
        if (leadAttachment.length) {
            await Promise.all(
                leadAttachment.map(async (element) => {
                    const attachment = {
                        key: element.filename,
                        contentType: element.Content_Type,
                        base64: element.base64,
                        ispreorpost: 0,
                        leadid: leadid,
                        opportunityid: opportunityid

                    };
                    toS3 = await UploadFileOnS3(attachment);

                    element.base64 = toS3.location

                    responseArr.push(element)


                })
            )
        }

        uploadFilesResponseObj = { code: 200, message: "success", data: responseArr }
        return uploadFilesResponseObj;

    } catch (error) {
        uploadFilesResponseObj = { code: 200, message: error.message }
        return uploadFilesResponseObj;

    }
};
