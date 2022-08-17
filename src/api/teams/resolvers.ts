import { DateTimeResolver } from "graphql-scalars";
import { getAllTeams, getFilteredTeam, getTeamById } from "./queries";
import { addTeam, updateTeam } from "./mutations";

export const teamsResolver = {
  Query: {
    getAllTeams: async () => getAllTeams(),
    getFilteredTeams: async (parent, _args: { data: any }, context) =>
      getFilteredTeam(parent, _args, context),
    getTeamById:async (parent, _args: { data: any }, context) =>
      getTeamById(parent, _args, context)
  },
  Mutation: {
    addTeam: async (parent, _args: { data: any }, context) =>
      addTeam(parent, _args, context),
    updateTeam: async (parent, _args: { data: any }, context) =>
      updateTeam(parent, _args, context)
  },
  DateTime: DateTimeResolver,
};
