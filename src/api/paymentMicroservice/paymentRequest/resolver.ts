import {GraphQLJSON} from 'graphql-scalars';
import {getPaymentRequest} from "./Queries/GetPaymentRequest";
import {CalculatePaymentRequest} from "./Mutations/CalculatePaymentRequest";
export const paymentRequestReslover = {
    Mutation:{
        AddPaymentRequests:async(_, args,{ dataSources , req })=>dataSources.AddPaymentRequests.addpaymentRequestData(args,req),
        UpdatePaymentRequests:async(_,args,{dataSources , req })=>dataSources.UpdatePaymentRequests.updatepaymentRequestData(args,req),
        DeletePaymentRequests:async(_,{requestID},{dataSources , req })=>dataSources.DeletePaymentRequests.deletepaymentRequestData(requestID,req),
        CalculatePaymentRequest:async(parent,_args:{ data: any}, context) =>CalculatePaymentRequest(parent, _args,context),
    },
    Query: {
       getPaymentRequest:async (parent, _args: { data: any }, context) =>getPaymentRequest(parent, _args, context),
    },
    JSON:GraphQLJSON
}
