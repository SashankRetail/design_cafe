import { DateTimeResolver } from "graphql-scalars";
import { updateMom } from "./Mutations/UpdateMom";
import { createMom } from "./Mutations/CreateMom";
import {getMomById } from "./Queries/getMomById";
import { getMomByProjectId } from "./Queries/getMomByProject";

export const projectMomResolver = {
  Query: {
    getMomById:async(parent, _args: { data: any }, context) => getMomById(parent,_args,context),
    getMomByProjectId:async (parent, _args: { data: any }, context) => getMomByProjectId(parent,_args,context),
  },
  Mutation:{
    createMom:async(parent,_args:{data:any},context) => createMom(parent,_args,context),
    updateMom:async(parent,_args:{data:any},context) => updateMom(parent,_args,context)
  },
  DateTime: DateTimeResolver,
};
