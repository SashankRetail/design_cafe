import { prisma } from "../../../prismaConfig";
import { defaultResponseObj } from "../../../utils/commonUtils";

export const getUserById = async (_root, args, _context) => {
  const { id } = args;

  try {
    const fetchedUser = await prisma.dc_users.findUnique({
      where: {
        userid: id,
      },
      include: {
        users_city: {
          include: { city: true },
        },
        profile: true,
        users_experiencecenters: {
          include: { center: true },
        },
        users_team: {
          include: { team: true },
        },
      },
    });

    defaultResponseObj.code = 200;
    defaultResponseObj.data = {
      ...fetchedUser,
      cities: fetchedUser.users_city.map((userCity) => {
        return {
          name: userCity.city.name,
          status: userCity.city.status,
          odoo_id: userCity.city.odoo_id,
          created_at: userCity.city.created_at,
          updated_at: userCity.city.updated_at,
          id: userCity.city.id,
        };
      }),
      teams: fetchedUser.users_team.map((usersTeam) => {
        return {
          name: usersTeam.team.name,
          teammailid: usersTeam.team.teammailid,
          reportingmanager: usersTeam.team.reportingmanager,
          teamlead: usersTeam.team.teamlead,
          department: usersTeam.team.department,
          odoo_id: usersTeam.team.odoo_id,
          create_at: usersTeam.team.create_at,
          updated_at: usersTeam.team.updated_at,
          id: usersTeam.team.id,
          teamsdepartment: usersTeam.team.teamsdepartment,
        };
      }),
      experiencecenters: fetchedUser.users_experiencecenters.map(
        (usersExperienceCenters) => {
          return {
            centerid: usersExperienceCenters.center.centerid,
            name: usersExperienceCenters.center.name,
            odoo_id: usersExperienceCenters.center.odoo_id,
            created_at: usersExperienceCenters.center.created_at,
            updated_at: usersExperienceCenters.center.updated_at,
            ectype: usersExperienceCenters.center.ectype,
            address: usersExperienceCenters.center.address,
            centerhead: usersExperienceCenters.center.centerhead,
            city: usersExperienceCenters.center.city,
          };
        }
      ),
    };
  } catch (e) {
    defaultResponseObj.code = 400;
    defaultResponseObj.message = e.message;
  }
  return defaultResponseObj;
};
