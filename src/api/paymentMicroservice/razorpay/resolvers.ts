import {GraphQLJSON} from 'graphql-scalars';
export const RazorpayReslovers = {
    Mutation:{
        RazorpayGeneratePaymentLink:async(_, args,{ dataSources , req })=>dataSources.RazorpayGeneratePaymentLink.paymentLinkData(args,req),
        RazorpayWebhook:async(_,args,{ dataSources,req})=>dataSources.RazorpayWebhook.webhookData(args,req),
    },
    JSON:GraphQLJSON
}
