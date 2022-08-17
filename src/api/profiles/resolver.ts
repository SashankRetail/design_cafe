import { DateTimeResolver ,GraphQLJSON} from 'graphql-scalars';
import { addProfile } from './Mutations/addmutations';
import { updateProfile } from './Mutations/updatemutations';
import { getAllProfiles } from './Queries/getAllProfiles';
import {getProfileById} from './Queries/getProfileById';

export const profilesResolver = {
    Mutation:{
        addProfile:async (parent, _args:{data: any}, context) => addProfile(parent, _args, context),
        updateProfile:async (parent,_args:{data:any},context) => updateProfile(parent,_args,context),
      },
      Query: {
        getAllProfiles: async () => getAllProfiles(),
        getProfileById: async (parent, _args: { data: any }, context) =>
        getProfileById(parent, _args, context),
      },
    DateTime: DateTimeResolver,
    JSON:GraphQLJSON
}
