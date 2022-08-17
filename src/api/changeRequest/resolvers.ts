import { addChangeRequest } from "./Mutations/addChangeRequest";
import { getChangeRequest } from "./Queries/getChangeRequest";

export const changeRequestResolver = {
  Mutation: {
    addChangeRequest: async (parent, _args: { data: any }, context) =>
      addChangeRequest(parent, _args, context),
  },
  Query: {
    getChangeRequest: async (parent, _args: { data: any }, context) =>
      getChangeRequest(parent, _args, context),
  },
};
