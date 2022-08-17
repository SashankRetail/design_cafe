import { DateTimeResolver } from "graphql-scalars";
import { editRequirementForm } from "./Mutations/editForm";
import { getRequirementForm } from "./queries";

export const requirementFormResolver = {
  Query: {
    getRequirementForm: async (parent, _args: { data: any }, context) =>
    getRequirementForm(parent, _args, context),
  },
  Mutation: {
    editRequirementForm: (parent, _args: { data: any }, context) => editRequirementForm(parent, _args, context)
  },
  DateTime: DateTimeResolver
}
