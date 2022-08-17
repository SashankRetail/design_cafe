import { prisma } from "../../prismaConfig"

export const addCity = async (root, args, context) => {
  let cityResponseObj
  const { name, status, odoo_id, cityhead, country } = args;
  try {
    const createdCity = await prisma.dc_cities.create({
      data: {
        name,
        status,
        odoo_id,
        created_at: new Date(),
        updated_at: new Date(),
        cityhead,
        country
      },
    });
    const cities = await prisma.dc_cities.findMany({
      where: { id: createdCity.id },
      include: {
        users: true
      }
    })
    let City = await getcity(cities);
    City = City.Data
    cityResponseObj = { code: 200, message: "success", data: City }
    return cityResponseObj
  } catch (error) {
    cityResponseObj = { code: 400, message: error.message }
    return cityResponseObj
  }
};

export const updateCity = async (root, args, context) => {
  let cityResponseObj;
  const { name, cityid, status, odoo_id, cityhead, country } = args;
  try {
    const updatedCity = await prisma.dc_cities.update({
      data: {
        name,
        status,
        odoo_id,
        updated_at: new Date(),
        cityhead,
        country
      }, where: { id: cityid }
    });

    const cities = await prisma.dc_cities.findMany({
      where: { id: updatedCity.id },
      include: {
        users: true
      }
    })
    let City = await getcity(cities);
    City = City.Data
    cityResponseObj = { code: 200, message: "success", data: City }
    return cityResponseObj
  } catch (error) {
    cityResponseObj = { code: 400, message: error.message }
    return cityResponseObj
  }
};
const getcity = async (cities) => {
  return {
    Data: cities.map((city) => {
      return {
        ...city,
        cityhead: city.users
      };
    })
  }
}
