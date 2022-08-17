import { prisma } from "../../prismaConfig";

export const getCities = async () => {
  let cityResponseObj
  try {
    const getcities = await prisma.dc_cities.findMany({
      include: {
        users: true
      }
    })

    let cities = await getcity(getcities);
    cities = cities.Data;

    cityResponseObj = { code: 200, message: "success", data: cities }
    return cityResponseObj
  }
  catch (error) {
    cityResponseObj = { code: 400, message: error.message }
    return cityResponseObj
  }
}

export const getCityById = async (root, args, context) => {
  let cityResponseObj;
  try {
    const getcities = await prisma.dc_cities.findMany({
      where: { id: args.id },
      include: {
        users: true
      }
    });
    let City = await getcity(getcities);
    City = City.Data;
    cityResponseObj = { code: 200, message: "success", data: City }
    return cityResponseObj
  }
  catch (error) {
    cityResponseObj = { code: 400, message: error.message }
    return cityResponseObj
  }
}
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
