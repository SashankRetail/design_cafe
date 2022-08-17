import { DateTimeResolver } from "graphql-scalars";
import { getDesignSignoffDocs } from "./Queries/getDesignSignoffDocs";
import { acceptDesignSignOffDocs } from "./Mutations/acceptDesignSignOffDocs";

export const designSignoffResolver = {
  Mutation: {
    acceptDesignSignOffDocs: (parent, _args: { data: any }, context) =>
      acceptDesignSignOffDocs(parent, _args, context),
  },
  Query: {
    getDesignSignoffDocs: async (parent, _args: { data: any }, context) =>
      getDesignSignoffDocs(parent, _args, context),
  },
  DateTime: DateTimeResolver
};
