import { DateTimeResolver } from "graphql-scalars";
import { leadSummary } from "./Queries/leadSummary";
import { conversion } from "./Queries/conversion";
import { upcomingMeetings } from "./Queries/upcomingMeetings";
import { broadcastedLeads } from "./Queries/broadcastedLeads";
import { proposalSent } from "./Queries/proposalSent";
import { totalActiveProjects } from "./Queries/totalActiveProjects";
import { achievedRevenue } from "./Queries/achievedRevenue";

export const widgetsResolver = {
    Query: {
        leadSummary: async (parent, _args: { data: any }, context) =>
        leadSummary(parent, _args, context),
        conversion: async (parent, _args: { data: any }, context) =>
        conversion(parent, _args, context),
        upcomingMeetings: async (parent, _args: { data: any }, context) =>
        upcomingMeetings(parent, _args, context),
        broadcastedLeads: async (parent, _args: { data: any }, context) =>
        broadcastedLeads(parent, _args, context),
        proposalSent: async (parent, _args: { data: any }, context) =>
        proposalSent(parent, _args, context),
        totalActiveProjects: async (parent, _args: { data: any }, context) =>
        totalActiveProjects(parent, _args, context),
        achievedRevenue: async (parent, _args: { data: any }, context) =>
        achievedRevenue(parent, _args, context),
    },
    DateTime: DateTimeResolver,
  };
