import { DateTimeResolver } from "graphql-scalars";
import { getProjects } from "./Queries/GetAllProject";
import { getProjectById } from "./Queries/GetProjectById";
import { addProject } from "./Mutations/AddProject";
import { addMilestoneFiles } from "./Mutations/AddMilestoneFiles";
import { getProjectCostBreakup } from "./Queries/GetProjectCostBreakup";
import { getProjectsByFilter } from "./Queries/GetProjectsByFilter";
import { updateProjectApi } from "./Mutations/UpdateProject";
import { completeChecklistApi } from "./Mutations/CompleteChecklistApi";
import { updatePaymentMilestones } from "./Mutations/UpdatePaymentMilestones";
import { getSubTaskForProject } from "./Queries/GetSubTaskForProject";
import { getFilesForProjects } from "./Queries/GetFilesForProject";
import { getFileUrl } from "./Queries/GetFileUrl";
import { meetingSchedulerMilestone } from "./Mutations/meetingSchedulerMilestone";
import { updateFormFillMilestones } from "./Mutations/UpdateFormFillMilestones";
import { shareFileWithCustomer } from "./Mutations/ShareFileWithCustomer";
import { completeMilestoneChecklist } from "./Mutations/CompleteMilestoneChecklist";
import { getOldProject } from "./Queries/GetOldProject";

export const projectsResolver = {
  Query: {
    allProjects: async () => getProjects(),
    getProjectById: async (parent, _args: { data: any }, context) =>
      getProjectById(parent, _args, context),
    getProjectCostBreakup: async (parent, _args: { data: any }, context) =>
      getProjectCostBreakup(parent, _args, context),
    getProjectsByFilter: async (parent, _args: { data: any }, context) =>
      getProjectsByFilter(parent, _args, context),
    getSubTaskForProject: async (parent, _args: { data: any }, context) =>
      getSubTaskForProject(parent, _args, context),
    getFiles: async (parent, _args: { data: any }, context) =>
      getFilesForProjects(parent, _args, context),
    getFileUrl: async (parent, _args: { data: any }, context) =>
      getFileUrl(parent, _args, context),
    getOldProject: async (parent, _args: { data: any }, context) =>
      getOldProject(parent, _args, context),
  },
  Mutation: {
    addProject: async (parent, _args: { data: any }, context) =>
      addProject(parent, _args, context),
    updateProjectApi: async (parent, _args: { data: any }, context) =>
      updateProjectApi(parent, _args, context),
    addMilestoneFiles: async (parent, _args: { data: any }, context) =>
      addMilestoneFiles(parent, _args, context),
    updatePaymentMilestones: async (parent, _args: { data: any }, context) =>
      updatePaymentMilestones(parent, _args, context),
    completeChecklistApi: async (parent, _args: { data: any }, context) =>
      completeChecklistApi(parent, _args, context),
    meetingSchedulerMilestone: async (parent, _args: { data: any }, context) =>
      meetingSchedulerMilestone(parent, _args, context),
    updateFormFillMilestones: async (
      parent,
      _args: { data: any },
      context
    ) => updateFormFillMilestones(parent, _args, context),
    shareFileWithCustomer: async (parent, _args: { data: any }, context) =>
      shareFileWithCustomer(parent, _args, context),
    completeMilestoneChecklist: async (parent, _args: { data: any }, context) =>
      completeMilestoneChecklist(parent, _args, context)
  },
  DateTime: DateTimeResolver,
};
