import { DateTimeResolver } from "graphql-scalars";
import { getBrodcastLeadsForUser } from "./Queries/getBroadCastLeadsForUser";
import { acceptRejectLeads } from "./Mutations/acceptRejectLeads";
import { assignTeamToLead } from "./Mutations/assignTeamToLead";
import { getLeadDetailsById } from "./Queries/getLeadDetailsById";
import { getMyLeads } from "./Queries/getMyLeads";
import { getRequirements } from "./Queries/getRequirements";
import { editRequirements } from "./Mutations/editRequirements";
import { updateDesigner } from "./Mutations/updateDesigner";
import { uploadLeadFiles } from "./Mutations/uploadLeadFiles";
import { uploadFilesInLeads } from "./Mutations/uploadFilesInLead";
import { getLeadAttachments } from "./Queries/getLeadAttachments";
import { assignDesigerToLeads } from "./Mutations/assignDesignerToLeadsByStudioManger";

export const leadsResolver = {
  Query: {
    getLeadDetailsById: async (parent, _args: { data: any }, context) =>
      getLeadDetailsById(parent, _args, context),
    getBroadcastLeadsForUser: async (parent, _args: { data: any }, context) =>
      getBrodcastLeadsForUser(parent, _args, context),
    getMyLeads: async (parent, _args: { data: any }, context) =>
      getMyLeads(parent, _args, context),
    getRequirements: async (parent, _args: { data: any }, context) =>
      getRequirements(parent, _args, context),
    getLeadAttachments: async (parent, _args: { data: any }, context) =>
      getLeadAttachments(parent, _args, context),
  },
  Mutation: {
    acceptRejectLeads: async (parent, _args: { data: any }, context) =>
      acceptRejectLeads(parent, _args, context),
    assignTeamsToLead: async (parent, _args: { data: any }, context) =>
      assignTeamToLead(parent, _args, context),
    editRequirements: async (parent, _args: { data: any }, context) =>
      editRequirements(parent, _args, context),
    uploadLeadFiles: async (parent, _args: { data: any }, context) =>
      uploadLeadFiles(parent, _args, context),
    uploadFilesInLeads: async (parent, _args: { data: any }, context) =>
      uploadFilesInLeads(parent, _args, context),
    updateDesigner: async (parent, _args: { data: any }, context) =>
      updateDesigner(parent, _args, context),
    assignDesigerToLeads:async(parent, _args: { data: any }, context) =>
    assignDesigerToLeads(parent, _args, context)
  },
  DateTime: DateTimeResolver,
};
