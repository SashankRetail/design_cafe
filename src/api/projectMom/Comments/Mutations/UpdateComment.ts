import { prisma } from "../../../../prismaConfig"
import { UploadFileOnS3 } from "../../../../domain/services/baseUseCase/baseUseCase"
import { authenticateDdCd } from "../../../../core/authControl/verifyAuthUseCase";

export const updateMomComment = async (root, args, context) => {

  let momCommentsResponse;

  try {
    await authenticateDdCd(context)

    let toS3;

    const { id, commentdetails, attachment } = args;

    if (attachment != null) {
      if (attachment.length) {
        await Promise.all(
          attachment.map(async (element) => {
            const attachedFile = {
              key: element.filename,
              contentType: element.Content_Type,
              base64: element.base64,
              commentid: momComment.id
            };
            toS3 = await UploadFileOnS3(attachedFile);

            element.data = toS3.location



          })
        )
      }
    }

    const momComment = await prisma.dc_mom_comments.update({
      data: { id, commentdetails, updatedate: new Date() },
      where: { id: id }
    });

    const commentObject = await prisma.dc_mom_comments.findMany({
      where: { id: momComment.id }
    });

    momCommentsResponse = { code: 200, message: "success", data: commentObject }
    return momCommentsResponse

  } catch (error) {
    momCommentsResponse = { code: 400, message: error.message }
    return momCommentsResponse
  }
};
