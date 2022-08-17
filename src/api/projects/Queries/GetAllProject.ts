import { prisma } from "../../../prismaConfig";

export const getProjects = async () => {
  let projectsResponseObj
  try {
    const projects = await prisma.dc_projects.findMany({
      include: {
        customer: true,
        designstudio : true,
        experiencecenter : true,
        city : true,
        designer : true,
        salesmanager : true,
        chm : true,
        surveyexecutive : true,
        projectmanager : true
      }
    });

    projectsResponseObj = { code: 200, message: "success", data: projects };
    return projectsResponseObj
  }
  catch (error) {
    projectsResponseObj = { code: 400, message: error.message }
    return projectsResponseObj
  }
}
