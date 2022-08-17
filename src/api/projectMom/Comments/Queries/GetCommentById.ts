import { prisma } from "../../../../prismaConfig";
import { authenticateDdCd } from "../../../../core/authControl/verifyAuthUseCase";

export const getCommentById = async (root, args, context) => {
  let momCommentsResponse;
  try {
    await authenticateDdCd(context)

    const momComment = await prisma.dc_mom_comments.findMany({
      where: { id: args.id, isshow: true }, include: {
        attachments: true
      }
    });

    momCommentsResponse = { code: 200, message: "success", data: momComment }
    return momCommentsResponse
  }
  catch (error) {
    momCommentsResponse = { code: 400, message: error.message }
    return momCommentsResponse
  }
}
