import {GraphQLJSON} from 'graphql-scalars';
import {getPaymentMilestoneList} from  './Queries/Getpaymentmilestonelist';
import {getPaymentMilestoneDetail} from './Queries/Getpaymentmilestonedetails';
import  {updateProject} from './Mutations/UpdateProjectAddress';
export const ProjectPaymentReslovers = {
    Mutation:{
        updateProject:async (parent, _args: { data: any }, context) =>updateProject(parent, _args, context),
    },
    Query: {
        getPaymentMilestoneList: async (parent, _args: { data: any }, context) =>getPaymentMilestoneList(parent, _args, context),
        getPaymentMilestoneDetail: async (parent, _args: { data: any }, context) =>getPaymentMilestoneDetail(parent, _args, context),
    },
    JSON:GraphQLJSON
}
