import { DateTimeResolver } from "graphql-scalars";
import { getExperienceCenters, getExperienceCenterById } from "./queries";
import { addExperienceCenter, updateExperienceCenter } from "./mutations";

export const experienceCenterResolver = {
  Query: {
    allExperienceCenters: async () => getExperienceCenters(),
    getExperienceCenterById: async (parent, _args: { data: any }, context) =>
      getExperienceCenterById(parent, _args, context),
  },
  Mutation: {
    addExperienceCenter: async (parent, _args: { data: any }, context) =>
      addExperienceCenter(parent, _args, context),
    updateExperienceCenter: async (parent, _args: { data: any }, context) =>
      updateExperienceCenter(parent, _args, context),
  },
  DateTime: DateTimeResolver,
};
