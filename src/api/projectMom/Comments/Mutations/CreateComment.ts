import { prisma } from "../../../../prismaConfig"
import { UploadFileOnS3 } from "../../../../domain/services/baseUseCase/baseUseCase"
import { authenticateDdCd } from "../../../../core/authControl/verifyAuthUseCase";

export const createMomComment = async (root, args, context) => {

  let momCommentsResponse;

  try {

    await authenticateDdCd(context)

    const { momid, commentdetails, addedby, attachment } = args;
    let toS3;

    const momComment = await prisma.dc_mom_comments.create({
      data: {
        momid,
        commentdetails,
        addedby,
        createdate: new Date(),
        isshow: true
      },

    })
    console.log(123, momComment)

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
    const commentObject = await prisma.dc_mom_comments.findMany({
      where: { id: momComment.id },
      include: {
        attachments: true
      }
    });
    momCommentsResponse = { code: 200, message: "success", data: commentObject }
    return momCommentsResponse

  } catch (error) {
    momCommentsResponse = { code: 400, message: error.message }
    return momCommentsResponse
  }
};
