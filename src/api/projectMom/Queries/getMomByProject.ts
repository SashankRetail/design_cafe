import { prisma } from "../../../prismaConfig";
import { authenticateDdCd } from "../../../core/authControl/verifyAuthUseCase";

export const getMomByProjectId = async (root, args, context) => {
  let momResponse;
  try {
     await authenticateDdCd(context)

    const projectMom = await prisma.dc_project_mom.findMany({
      where: { projectid: args.projectid, status: args.status },
      include: {
        attachments: true,
        momComments: true
      }
    });
    let attachmentscount = 0;
    await Promise.all(
      projectMom.map((momattachments) => {
        const attachments = momattachments.attachments;
        if (attachments.length !== 0) {
          attachments.map((attachement) => {
            if (Object.keys(attachement).length) {
              attachmentscount++

            }

          })
        }
      })
    )
    console.log(76, attachmentscount)
    momResponse = { code: 200, message: "success", data: projectMom, attachmentscount: attachmentscount }
    return momResponse
  }
  catch (error) {
    momResponse = { code: 400, message: error.message }
    return momResponse
  }
}
