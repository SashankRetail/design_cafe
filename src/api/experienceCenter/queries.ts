import { prisma } from "../../prismaConfig"

export const getExperienceCenters = async () => {
  let experienceCenterResponseObj;
  try {

    const experienceCenters = await prisma.dc_experiencecenters.findMany({
      include: {
        cities: true,
        users: true
      }
    })

    let ExperienceCenters = await getExperienceCenter(experienceCenters);

    ExperienceCenters = ExperienceCenters.Data

    experienceCenterResponseObj = { code: 200, message: "success", data: ExperienceCenters }
    return experienceCenterResponseObj;
  } catch (error) {
    experienceCenterResponseObj = { code: 400, message: error.message }
    return experienceCenterResponseObj;
  }
}


export const getExperienceCenterById = async (root, args, context) => {
  let experienceCenterResponseObj;
  try {
    const experienceCenter = await prisma.dc_experiencecenters.findMany({
      where: { centerid: args.centerid }, include: {
        cities: true,
        users: true
      }
    })

    let ExperienceCenter = await getExperienceCenter(experienceCenter);

    ExperienceCenter = ExperienceCenter.Data
    experienceCenterResponseObj = { code: 200, message: "success", data: ExperienceCenter }
    return experienceCenterResponseObj;
  } catch (error) {
    experienceCenterResponseObj = { code: 400, message: error.message }
    return experienceCenterResponseObj;
  }
};
const getExperienceCenter = async (experienceCenter) => {
  return {
    Data: experienceCenter.map((experiencecenter) => {
      return {
        ...experiencecenter,
        city: experiencecenter.cities,
        centerhead: experiencecenter.users
      };
    })
  }
}
