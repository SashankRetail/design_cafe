import { prisma } from "../../prismaConfig"

export const addTeam = async (root, args, context) => {
  let teamResponseObj

  const { name, odoo_id, reportingmanager, teammailid, teamlead, experiencecenters, cities, teamsdepartment } = args;
  try {
    const team = await prisma.dc_teams.create({
      data: {
        name,
        teammailid,
        reportingmanager,
        teamlead,
        odoo_id,
        create_at: new Date(),
        updated_at: new Date(),
        teamsdepartment
      },
    });

    const experiencecenterArr = []

    experiencecenters.forEach(async element => {
      experiencecenterArr.push({
        teamid: team.id,
        centerid: element,
        created_at: new Date(),
        updated_at: new Date(),
      })
    });
    await prisma.dc_teams_experiencecenters.createMany({ data: experiencecenterArr })

    const citiesArr = [];
    cities.forEach(async element => {
      citiesArr.push({
        teamid: team.id,
        cityid: element,
        created_at: new Date(),
        updated_at: new Date(),
      })

    });
    await prisma.dc_teams_city.createMany({ data: citiesArr })
    const teams = await prisma.dc_teams.findMany({
      where: { id: team.id },
      include: {
        team_city: {
          include: { city: true }
        },
        team_experiencecenters: {
          include: { center: true }
        },
        departments: true
      }
    })

    let Team = await getteam(teams);
    Team = Team.Teams;
    teamResponseObj = { code: 200, message: "success", data: Team }
    return teamResponseObj
  } catch (error) {
    console.log(63,error)
    teamResponseObj = { code: 400, message: error.message }
    return teamResponseObj
  }
}

export const updateTeam = async (root, args, context) => {
  let teamResponseObj
  try {
    const { id, name, odoo_id, reportingmanager, teammailid, teamlead, teamsdepartment, experiencecenters, cities } = args;

    await prisma.dc_teams.update({
      data: {
        name,
        teammailid,
        reportingmanager,
        teamlead,
        odoo_id,
        updated_at: new Date(),
        teamsdepartment
      },
      where: {
        id: id,
      }
    });
    const teamCity = await prisma.dc_teams_city.findMany({ where: { teamid: id } })
    const alreadyAssignedCities = []
    if (teamCity) {
      teamCity.forEach(async element => {
        alreadyAssignedCities.push(element.cityid)
      });
    }
    let citiesInRequest = []
    citiesInRequest = cities;

    var citiesToAdd = citiesInRequest.filter(function (n) {
      return !this.has(n)
    }, new Set(alreadyAssignedCities));
    let citiesToBeAdded = [];

    const citiesArr = [];

    if (citiesToAdd) {
      citiesToBeAdded = citiesToAdd;
      citiesToBeAdded.forEach(async element => {
        citiesArr.push({
          teamid: id,
          cityid: element,
          created_at: new Date(),
          updated_at: new Date(),
        })

      });
      await prisma.dc_teams_city.createMany({ data: citiesArr })

    }

    var citiesToDelete = alreadyAssignedCities.filter(function (n) {
      return !this.has(n)
    }, new Set(citiesInRequest));

    let citiesToBeDeleted = [];

    if (citiesToDelete) {
      citiesToBeDeleted = citiesToDelete;
      await prisma.dc_teams_city.deleteMany({
        where: {
          cityid: { in: citiesToBeDeleted },
          teamid: id
        },
      })


    }

    const teamEC = await prisma.dc_teams_experiencecenters.findMany({ where: { teamid: id } })
    const alreadyAssignedEC = []
    if (teamEC?.length) {
      teamEC.forEach(async element => {
        alreadyAssignedEC.push(element.centerid)
      });
    }
    let ECInRequest = []
    ECInRequest = experiencecenters;

    var ECsToAdd = ECInRequest.filter(function (n) {
      return !this.has(n)
    }, new Set(alreadyAssignedEC));
    let ECsToBeAdded = [];

    const experiencecenterArr = [];

    if (ECsToAdd?.length) {
      ECsToBeAdded = ECsToAdd;
      ECsToBeAdded.forEach(async element => {
        experiencecenterArr.push({
          teamid: id,
          centerid: element,
          created_at: new Date(),
          updated_at: new Date(),
        })

      });
      await prisma.dc_teams_experiencecenters.createMany({ data: experiencecenterArr })

    }

    var ECsToDelete = alreadyAssignedEC.filter(function (n) {
      return !this.has(n)
    }, new Set(ECInRequest));

    let ECsToBeDeleted = [];

    if (ECsToDelete?.length) {

      ECsToBeDeleted = ECsToDelete;

      await prisma.dc_teams_experiencecenters.deleteMany({
        where: {
          centerid: { in: ECsToBeDeleted },
          teamid: id
        },
      })
    }

    const teams = await prisma.dc_teams.findMany({
      where: { id: id },
      include: {
        team_city: {
          include: { city: true }
        },
        team_experiencecenters: {
          include: { center: true }
        },
        departments: true
      }
    })


    let Team = await getteam(teams);
    Team = Team.Teams;

    teamResponseObj = { code: 200, message: "success", data: Team }
    return teamResponseObj
  } catch (error) {
    teamResponseObj = { code: 400, message: error.message }
    return teamResponseObj
  }
};

const getteam = async (teams) => {
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
    })
  }
}


