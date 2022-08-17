import { DateTimeResolver } from "graphql-scalars";
import { triggerEmail } from "./Mutations/triggerEmailFromSF";

export const trigerEmailResolver = {
    Mutation: {
        triggerEmail: async (parent, _args: { data: any }, context) =>
        triggerEmail(parent, _args, context),
    },
    DateTime: DateTimeResolver,
}
