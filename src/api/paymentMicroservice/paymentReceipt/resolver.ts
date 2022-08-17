import {GraphQLJSON} from 'graphql-scalars';
import {getPaymentReceipt}  from './Queries/getPaymentReceipt';
import { AddPaymentConformation } from './Mutation/AddPaymentConformation';
import { UpdatePaymentConformation } from './Mutation/UpdatePaymentConformation';
import { ClearPaymentConformation } from './Mutation/ClearPaymentConformation';
export const paymentReceiptReslover = {
    Mutation:{
        AddPaymentReceipts:async(_, args,{ dataSources , req })=>dataSources.AddPaymentReceipts.addpaymentReceiptData(args,req),
        UpdatePaymentReceipts:async(_,args,{ dataSources ,req })=>dataSources.UpdatePaymentReceipts.updatepaymentReceiptData(args,req),
        DeletePaymentReceipts:async(_,args,{ dataSources ,req})=>dataSources.DeletePaymentReceipts.deletepaymentReceiptData(args,req),
        AddPaymentConformation:async(parent,_args:{data: any },context) =>AddPaymentConformation(parent, _args, context),
        UpdatePaymentConformation:async(parent,_args:{data: any },context)=>UpdatePaymentConformation(parent, _args, context),
        ClearPaymentConformation:async(parent,_args:{data: any },context)=>ClearPaymentConformation(parent,_args,context),
    },
    Query: {
        getPaymentReceipt:async (parent, _args: { data: any }, context) =>getPaymentReceipt(parent, _args, context),
     },
    JSON:GraphQLJSON
}
