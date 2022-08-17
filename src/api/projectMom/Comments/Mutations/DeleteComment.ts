import { prisma } from "../../../../prismaConfig"
import { authenticateDdCd } from "../../../../core/authControl/verifyAuthUseCase";

export const deleteMomComment = async (_root, args,_context) => {

  let momCommentsResponse;

  const {id, deletedby} = args;
  try {
    await authenticateDdCd(_context)
    const momComment = await prisma.dc_mom_comments.update({
      data: {
          id,
          deletedby,
          deleteddate : new Date(),
          isshow : false
      },where: { id: id }
    })

    const commentObject = await prisma.dc_mom_comments.findMany({
      where: {id: momComment.id}
    });
    momCommentsResponse = { code: 200, message: "success", data: commentObject}
    return momCommentsResponse

  } catch (error) {
    momCommentsResponse = { code: 400, message: error.message }
    return momCommentsResponse
  }
};
