import { prisma } from "../../../prismaConfig";

export const getAllUsers = async (_root, args, _context) => {
  const {userType} = args

  const getAllUsersResponse = {
    code: 200,
    message: "",
    users: null,
  };

  try {
    const allUsers = await prisma.dc_users.findMany({
      where : {
        profileid:userType
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
      }
    });
    getAllUsersResponse.users = mapAllUsers(allUsers);
  } catch (e) {
    console.log(38,e)
    getAllUsersResponse.code = 400;
    getAllUsersResponse.message = e.message;
    getAllUsersResponse.users = null;
  }

  return getAllUsersResponse;
};

export const mapAllUsers = (allUsers) => {
  return allUsers.map((user) => {
    return {
      ...user,
      cities: user.users_city.map((userCity) => {
        return {
          name: userCity.city?.name,
          status: userCity.city?.status,
          odoo_id: userCity.city?.odoo_id,
          created_at: userCity.city?.created_at,
          updated_at: userCity.city?.updated_at,
          id: userCity.city?.id,
        };
      }),
      teams: user.users_team.map((usersTeam) => {
        return {
          name: usersTeam.team?.name,
          teammailid: usersTeam.team?.teammailid,
          reportingmanager: usersTeam.team?.reportingmanager,
          teamlead: usersTeam.team?.teamlead,
          department: usersTeam.team?.department,
          odoo_id: usersTeam.team?.odoo_id,
          create_at: usersTeam.team?.create_at,
          updated_at: usersTeam.team?.updated_at,
          id: usersTeam.team?.id,
          teamsdepartment: usersTeam.team?.teamsdepartment,
        };
      }),
      experiencecenters: user.users_experiencecenters.map(
        (usersExperienceCenters) => {
          return {
            centerid: usersExperienceCenters.center?.centerid,
            name: usersExperienceCenters.center?.name,
            odoo_id: usersExperienceCenters.center?.odoo_id,
            created_at: usersExperienceCenters.center?.created_at,
            updated_at: usersExperienceCenters.center?.updated_at,
            ectype: usersExperienceCenters.center?.ectype,
            address: usersExperienceCenters.center?.address,
            centerhead: usersExperienceCenters.center?.centerhead,
            city: usersExperienceCenters.center?.city,
          };
        }
      ),
    };
  });
};
