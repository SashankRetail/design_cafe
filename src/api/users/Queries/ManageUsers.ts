import { prisma } from "../../../prismaConfig";

export const getManageUsersData = async (parent, _args, context) => {
  return {
    Cities: prisma.dc_cities.findMany(),
    Departments: prisma.dc_department.findMany(),
    Teams: prisma.dc_teams.findMany(),
    Profiles: prisma.dc_profile.findMany(),
    ExperienceCenters: prisma.dc_experiencecenters.findMany(),
  };
};
