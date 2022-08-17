import { cardStatus } from "./Mutation/mutation";
import { DateTimeResolver } from "graphql-scalars";

export const homescreenWgidgetResolver = {
    Mutation: {
      cardStatus: (parent, _args: { data: any }, context) => cardStatus(parent, _args, context)
    },
    DateTime: DateTimeResolver
  }
