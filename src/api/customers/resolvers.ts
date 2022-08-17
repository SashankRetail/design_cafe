import { DateTimeResolver } from "graphql-scalars";
import { login } from "./Mutations/login";
import { verifyOtp } from "./Mutations/verifyOtp";
import { addCustomer } from "./Mutations/addCustomer";
import { reIssueAccessTokenCD } from "./Mutations/reIssueAccessTokenCD";
import { raiseTicket } from "./customerSupport/Mutations/raiseTicket"
import { raiseComment } from "./customerSupport/Mutations/raiseComment";
import { viewAllRaisedTickets } from "./customerSupport/Queries/viewAllRaisedTickets";
import { getCustomerDetailsByAuth } from "./Queries/getCustomerByAuth";
import { updateCustomer } from "./Mutations/updateCustomer";
import {updateCustomerDetails} from "./Mutations/updateCustomerDetails";
import { updateCustomerSFID } from "./Mutations/updateCustomerSFID";
import {updateCustomerOpportunityId} from "./Mutations/updateCustomerOpportunityId";


export const customerResolver = {
  Query: {
    viewAllRaisedTickets: async (parent, _args: { data: any }, context) => viewAllRaisedTickets(parent, _args, context),
    getCustomerDetailsByAuth: async (parent, _args: { data: any }, context) =>
      getCustomerDetailsByAuth(parent, _args, context),
  },
  Mutation: {
    login: async (parent, _args: { data: any }, context) =>
      login(parent, _args, context),
    verifyOtp: (parent, _args: { data: any }, context) =>
      verifyOtp(parent, _args, context),
    reIssueAccessTokenCD: (parent, _args: { data: any }, context) =>
      reIssueAccessTokenCD(parent, _args, context),
    addCustomers: (parent, _args: { data: any }, context) =>
      addCustomer(parent, _args, context),
    raiseTicket: (parent, _args: { data: any }, context) => raiseTicket(parent, _args, context),
    raiseComment: (parent, _args: { data: any }, context) => raiseComment(parent, _args, context),
    updateCustomerData:(parent, _args: { data: any }, context) => updateCustomerData(parent, _args, context),
    updateCustomerSFID:(parent, _args: { data: any }, context) => updateCustomerSFID(parent, _args, context),
    updateCustomerDetails:(parent, _args: { data: any }, context) => updateCustomerDetails(parent, _args, context),
    updateCustomers:(parent, _args: { data: any }, context) => updateCustomer(parent, _args, context),
    updateCustomerOpportunityId:(parent, _args: { data: any }, context) => updateCustomerOpportunityId(parent, _args, context)
  },
  DateTime: DateTimeResolver,
};
