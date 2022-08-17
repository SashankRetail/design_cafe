import { prisma } from "../../../prismaConfig"

export const createMom = async (root, args, context) => {

  let momResponse;
  try {

    const { projectid, milestoneid, status } = args;

    const projectMom = await prisma.dc_project_mom.create({
      data: {
        projectid, milestoneid, status
      },
    })
    const projectMOmObject = await prisma.dc_project_mom.findMany({
      where: { id: projectMom.id },
      include: {
        momComments: true
      }

    });
    momResponse = { code: 200, message: "success", data: projectMOmObject }
    return momResponse

  } catch (error) {
    momResponse = { code: 400, message: error.message }
    return momResponse
  }
};
