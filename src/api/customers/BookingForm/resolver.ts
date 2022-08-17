import { DateTimeResolver } from "graphql-scalars";
import { getBookingForm } from "./Queries/getBookingForm";
import { acceptBookingForm } from "./Mutations/acceptBookingForm";
import { updateBookingFormStatus } from "./Mutations/updateBookingFormStatus";

export const bookingFormResolver = {
  Mutation: {
    acceptBookingForm: (parent, _args: { data: any }, context) =>
      acceptBookingForm(parent, _args, context),
    updateBookingFormStatus: (parent, _args: { data: any }, context) =>
      updateBookingFormStatus(parent, _args, context),
  },
  Query: {
    getBookingForm: async (parent, _args: { data: any }, context) =>
      getBookingForm(parent, _args, context),
  },
  DateTime: DateTimeResolver,
};
