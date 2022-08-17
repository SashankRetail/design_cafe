import { prisma } from "../../../prismaConfig";
import { authenticateDdCd } from "../../../core/authControl/verifyAuthUseCase";

export const getMomById = async (root, args, context) => {
  let momResponse;
  try {
    await authenticateDdCd(context)

    const projectMom = await prisma.dc_project_mom.findMany({
      where: { id: args.id },
      include: {
        attachments: true,
        momComments: true,
      }
    });
    const momComments = projectMom[0].momComments
    let momComment;
    await Promise.all(
      momComments.map(async (element) => {
        momComment = await prisma.dc_mom_comments.findMany({
          where: { id: element.id, isshow: true }, include: {
            attachments: true
          }
        });
        element["attachments"] = momComment[0].attachments
      })
    )
    momResponse = { code: 200, message: "success", data: projectMom }
    return momResponse
  }
  catch (error) {
    momResponse = { code: 400, message: error.message }
    return momResponse
  }
}
