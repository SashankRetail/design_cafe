import { DateTimeResolver } from "graphql-scalars";
import { getManageUsersData } from "../users/Queries/ManageUsers";
import { googleAuthorize } from "../users/Queries/UserAuthenticateApiUseCase";
import { googleAuthorizeCallBack } from "../users/Queries/UserAuthenticateCallBack";
import { editUsers } from "./Mutations/editUsers";
import { addUser } from "./Mutations/addUser";
import { getAllUsers } from "./Queries/GetAllUsers";
import { reIssueAccessToken } from "./Queries/ReIssueAccessToken";
import { getUserDetailsByAuth } from "./Queries/GetUserDetailsByAuth";
import { getAllDesigners } from "./Queries/GetAllDesigners";
import { getUserById } from "./Queries/GetUserById";

export const usersResolver = {
  Query: {
    allManageUsersData: async (parent, _args: { data: any }, context) =>
      getManageUsersData(parent, _args, context),
    googleAuthorize: () => googleAuthorize(),
    googleAuthorizeCallBack: async (parent, _args: { data: any }, context) =>
      googleAuthorizeCallBack(parent, _args, context),
    reIssueAccessToken: async (parent, _args: { data: any }, context) =>
      reIssueAccessToken(parent, _args, context),
    getAllUsers: async (parent, _args: { data: any }, context) =>
      getAllUsers(parent, _args, context),
    getUserDetailsByAuth: async (parent, _args: { data: any }, context) =>
      getUserDetailsByAuth(parent, _args, context),
    getAllDesigners: async (parent, _args: { data: any }, context) =>
      getAllDesigners(parent, _args, context),
    getUserById: async (parent, _args: { data: any }, context) =>
        getUserById(parent, _args, context),
  },
  Mutation: {
    updateUser: (parent, _args: { data: any }, context) =>
      editUsers(parent, _args, context),
    addUser: async (parent, _args: { data: any }, context) =>
      addUser(parent, _args, context),
  },
  DateTime: DateTimeResolver,
};
