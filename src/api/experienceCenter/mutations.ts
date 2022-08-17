import { prisma } from "../../prismaConfig"

export const addExperienceCenter = async (root, args, context) => {
  let experienceCenterResponseObj

  const { name, odoo_id, centerhead, city, ectype, address } = args;
  try {

    const EC = await prisma.dc_experiencecenters.create({
      data: {
        name,
        odoo_id,
        created_at: new Date(),
        updated_at: new Date(),
        ectype,
        address,
        centerhead,
        city
      },
    });
    const experienceCenter = await prisma.dc_experiencecenters.findMany({
      where: { centerid: EC.centerid },
      include: {
        users: true,
        cities: true
      }
    })

    let ExperienceCenter = await getExperienceCenter(experienceCenter);
    ExperienceCenter = ExperienceCenter.Data

    experienceCenterResponseObj = { code: 200, message: "success", data: ExperienceCenter }
    return experienceCenterResponseObj

  } catch (error) {
    experienceCenterResponseObj = { code: 400, message: error.message }
    return experienceCenterResponseObj
  }
};

export const updateExperienceCenter = async (root, args, context) => {
  let experienceCenterResponseObj;
  const { name, centerid, odoo_id, centerhead, city, ectype, address } = args;
  try {
    const EC = await prisma.dc_experiencecenters.update({
      data: {
        name,
        odoo_id,
        updated_at: new Date(),
        ectype,
        address,
        centerhead,
        city
      }, where: { centerid: centerid }
    });
    const experienceCenter = await prisma.dc_experiencecenters.findMany({
      where: { centerid: EC.centerid },
      include: {
        users: true,
        cities: true
      }
    })

    let ExperienceCenter = await getExperienceCenter(experienceCenter);

    ExperienceCenter = ExperienceCenter.Data

    experienceCenterResponseObj = { code: 200, message: "success", data: ExperienceCenter }
    return experienceCenterResponseObj
  } catch (error) {
    experienceCenterResponseObj = { code: 400, message: error.message }
    return experienceCenterResponseObj
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
