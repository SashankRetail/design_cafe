import { GraphQLJSON, DateTimeResolver } from "graphql-scalars";
import { createSmartSheet } from "./Mutations/CreateSmartsheet";
import { updateDesignerEmail } from "./Mutations/UpdateDesigner";
import { updateSurvey } from "./Mutations/UpdateSurvey";
import { updateProjectValue } from "./Mutations/UpdateProjectValue";
import { updateProjectAddress } from "./Mutations/UpdateProjectAddress";
import { updateMilestone } from "./Mutations/UpdateMilestone";
import { getMileStoneDetails } from "./Queries/GetMileStonesDetails";
import { updateProjectStatus } from "./Mutations/UpdateProjectStatus";
import { webHookCallBack } from "./Mutations/WebhookCallBack";
import { updatePaymentChecklist} from "./Mutations/UpdatePaymentChecklist";

export const smartSheetResolver = {
  Query: {
    getMileStoneDetails: async (parent, _args: { data: any }, context) =>
      getMileStoneDetails(parent, _args, context),
  },
  Mutation: {
    createSmartSheet: async (parent, _args: { data: any }, context) =>
      createSmartSheet(parent, _args, context),
    updateProjectValue: async (parent, _args: { data: any }, context) =>
      updateProjectValue(parent, _args, context),
    updateProjectAddress: async (parent, _args: { data: any }, context) =>
      updateProjectAddress(parent, _args, context),
    updateMilestone: async (parent, _args: { data: any }, context) =>
      updateMilestone(parent, _args, context),
    updateDesignerEmail: async (parent, _args: { data: any }, context) =>
      updateDesignerEmail(parent, _args, context),
    updateSurvey: async (parent, _args: { data: any }, context) =>
      updateSurvey(parent, _args, context),
    updateProjectStatus: async (parent, _args: { data: any }, context) =>
      updateProjectStatus(parent, _args, context),
    webHookCallBack: async (parent, _args: { data: any }, context) =>
      webHookCallBack(parent, _args, context),
    updatePaymentChecklist: async (parent, _args: { data: any }, context) =>
      updatePaymentChecklist(parent, _args, context),
  },
  DateTime: DateTimeResolver,
  JSON: GraphQLJSON,
};
