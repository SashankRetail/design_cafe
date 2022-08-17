import { DateTimeResolver } from "graphql-scalars";
import { assignDesignerToOpportunity } from "./Mutation/assignDesignerToOpportunity";
import { getMyOpportunities } from "./Queries/getMyOpportunities";
import { getOpportunityDetailsById } from "./Queries/getOpportunityById";

export const opportunityResolver = {
  Query: {
    getMyOpportunities:(parent, _args: { data: any }, context) => getMyOpportunities(parent,_args,context),
    getOpportunityDetailsById:(parent, _args: { data: any }, context) => getOpportunityDetailsById(parent,_args,context)
  },
  Mutation:{
    assignDesignerToOpportunity:(parent,_args: { data: any }, context) => assignDesignerToOpportunity(parent,_args,context)
  },
  DateTime: DateTimeResolver,
};
