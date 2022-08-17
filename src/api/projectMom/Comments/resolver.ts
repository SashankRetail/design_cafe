import { DateTimeResolver } from "graphql-scalars";
import { createMomComment } from "../Comments/Mutations/CreateComment";
import { updateMomComment } from "../Comments/Mutations/UpdateComment";
import { deleteMomComment } from "../Comments/Mutations/DeleteComment";
import { getCommentById } from "../Comments/Queries/GetCommentById";

export const momCommentResolver = {
  Query: {
    getCommentById:async(parent, _args: { data: any }, context) => getCommentById(parent,_args,context),
  },
  Mutation:{
    createMomComment:async(parent,_args:{data:any},context) => createMomComment(parent,_args,context),
    updateMomComment:async(parent,_args:{data:any},context) => updateMomComment(parent,_args,context),
    deleteMomComment:async(parent,_args:{data:any},context) => deleteMomComment(parent,_args,context)
  },
  DateTime: DateTimeResolver,
};
