import { DateTimeResolver } from "graphql-scalars";
import { replyToTicketMessage } from "../dcSupport/Mutations/replyToTicketMessage"
import { updateTicketStatus } from "../dcSupport/Mutations/updateTicketStatus"
import { fetchTickets } from "./Queries/fetchTickets";
import { fetchTicketById } from "./Queries/fetchTicketById";
import { fetchTicketMessage } from "../dcSupport/Queries/fetchTicketMessage";
import { webHookTicket } from "../dcSupport/Queries/webHookTicket";

export const dcSupportResolver = {
  Query: {
    fetchTickets: async (parent, _args: { data: any }, context) =>
      fetchTickets(parent, _args, context),
    fetchTicketById: async (parent, _args: { data: any }, context) =>
      fetchTicketById(parent, _args, context),
    fetchTicketMessage: async (parent, _args: { data: any }, context) =>
      fetchTicketMessage(parent, _args, context),
    webHookTicket: async (parent, _args: { data: any }, context) =>
      webHookTicket(parent, _args, context),
  },
  Mutation: {
    replyToTicketMessage: (parent, _args: { data: any }, context) => replyToTicketMessage(parent, _args, context),
    updateTicketStatus: (parent, _args: { data: any }, context) => updateTicketStatus(parent, _args, context)
  },
  DateTime: DateTimeResolver
}
