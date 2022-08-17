import {GraphQLJSON} from 'graphql-scalars';
import {getCustomerAddress} from './Queries/getCustomerAddress';
export const customerPaymentReslovers = {
    Mutation:{
        UpdateCustomer:async(_, args,{ dataSources , req })=>dataSources.UpdateCustomer.updateCustomerData(args,req)
    },
    Query:{
        getCustomerAddress:async (parent, _args: { data: any }, context) =>getCustomerAddress(parent, _args, context),
    },
    JSON:GraphQLJSON
}
