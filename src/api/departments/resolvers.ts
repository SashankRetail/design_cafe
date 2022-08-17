import { DateTimeResolver } from "graphql-scalars";
import { getAllDepartments } from "./Queries/getAllDepartments";

export const departmentResolver = {
  Query: {
    getAllDepartments:async()=> getAllDepartments()
  },
  Mutation: {
  },
  DateTime: DateTimeResolver,
};
