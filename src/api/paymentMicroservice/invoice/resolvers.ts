import { DateTimeResolver} from 'graphql-scalars';
import { CalculateInvoicenewflow } from './Mutation/CalculateInvoicenewflow';
import {generateInvoiceOldFlow} from './Mutation/GenerateInvoiceoldflow';
import{getInvoiceNewFlow} from './Queries/getInvoicenewflow';
import {UpdateInvoiceOldFlow} from './Mutation/UpdateInvoiceoldflow';


export const InvoiceResolver = {
    Mutation:{
       generateInvoiceOldFlow:async(parent,_args:{data:any},context)=> generateInvoiceOldFlow(parent,_args,context),
       GenerateInvoicenewflow:async(_,args,{ dataSources ,req })=>dataSources.GenerateInvoicenewflow.generateInvoiceNewFlowData(args,req),
       CalculateInvoicenewflow:async(parent,_args:{data:any},context) =>CalculateInvoicenewflow(parent,_args,context),
       UpdateInvoiceOldFlow:async(parent,_args:{data:any},context) =>UpdateInvoiceOldFlow(parent,_args,context)
    },
    Query: {
        getInvoiceNewFlow:async (parent, _args: { data: any }, context) =>getInvoiceNewFlow(parent, _args, context),
     },
    DateTime: DateTimeResolver,

}
