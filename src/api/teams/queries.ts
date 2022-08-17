import { prisma } from "../../prismaConfig";
import { defaultResponseObj } from "../../utils/commonUtils";

export const getAllTeams = async () => {
  const teams = await prisma.dc_teams.findMany({
    include: {
      team_city: {
        include: { city: true },
      },
      team_experiencecenters: {
        include: { center: true },
      },
      reportingmanageruser:true,
      departments: true,
    },
  });

  return {
    Teams: teams.map((team) => {
      return {
        ...team,
        cities: team.team_city.map((c) => {
          return { name: c.city.name, id: c.city.id };
        }),
        experiencecenters: team.team_experiencecenters.map((c) => {
          return { name: c.center.name, centerid: c.center.centerid };
        }),
      };
    }),
  };
};

export const getTeamById = async(root, args, context) =>{
  const {id} = args;
  try{
    const fetchedTeam = await prisma.dc_teams.findUnique({
      where:{
        id:id
      },
      include: {
        team_city: {
          include: { city: true },
        },
        team_experiencecenters: {
          include: { center: true },
        },
        departments: true,
      }
    })
    defaultResponseObj.code = 200
    defaultResponseObj.data =  {
      ...fetchedTeam,
      cities: fetchedTeam.team_city.map((c) => {
        return { name: c.city.name, id: c.city.id };
      }),
      experiencecenters: fetchedTeam.team_experiencecenters.map((c) => {
        return { name: c.center.name, centerid: c.center.centerid };
      }),
    };
  }
  catch(e){
    defaultResponseObj.code = 400
    defaultResponseObj.message = e.message
  }
  return defaultResponseObj;
}

export const getFilteredTeam = async (_root, args, _context) => {
  const { department } = args;
  const teams = await prisma.dc_teams.findMany({
    where: { department: department },
    include: {
      team_city: {
        include: { city: true },
      },
      departments: true,
    },
  });

  return {
    Teams: teams.map((team) => {
      return {
        ...team,
        cities: team.team_city.map((c) => {
          return { name: c.city.name };
        }),
      };
    }),
  };
};
