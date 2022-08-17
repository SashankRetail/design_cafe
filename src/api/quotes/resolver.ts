import { DateTimeResolver } from "graphql-scalars";
import { getQuotation } from "./Queries/getQuotation";
import { getQuotationById } from "./Queries/getQuotationById";
import { getRoomList } from "./Queries/getRoomList";
import { validateXmlApi } from "./Mutations/preSales/validateXml";
import { postBetaQuote } from "./Mutations/preSales/postBetaQuoteApi";
import { UpdateQuoteDetails } from "./Mutations/preSales/updateQuoteDetailsFromSF";
import { saveBetaQuoteApi } from "./Mutations/preSales/saveBetaQuoteDetails";
import { proposalSignedUrl } from "./Mutations/preSales/proposalSignedUrl";
import { deleteRoomwise } from "./Mutations/postSales/deleteRoomwise";
import { PostRoomwiseXmlApi } from "./Mutations/postSales/postRoomWiseXml";
import { updateDiscountGeneratePdf } from "./Mutations/postSales/updateDiscountGeneratePdf";
import { updateProjectCommercial } from "./Mutations/postSales/updateProjectCommercial";
import { acceptProposal } from "./Mutations/preSales/acceptProposal";

export const quotationResolver = {
  Query: {
    getQuotation: async (parent, _args: { data: any }, context) =>
      getQuotation(parent, _args, context),
    getQuotationById: async (parent, _args: { data: any }, context) =>
      getQuotationById(parent, _args, context),
    getRoomList: async (parent, _args: { data: any }, context) =>
      getRoomList(parent, _args, context),
  },
  Mutation: {
    /* preSales */
    proposalSignedUrl: async (parent, _args: { data: any }, context) =>
      proposalSignedUrl(parent, _args, context),
    postBetaQuote: async (parent, _args: { data: any }, context) =>
      postBetaQuote(parent, _args, context),
    saveBetaQuoteApi: async (parent, _args: { data: any }, context) =>
      saveBetaQuoteApi(parent, _args, context),
    validateXmlApi: async (parent, _args: { data: any }, context) =>
      validateXmlApi(parent, _args, context),
    UpdateQuoteDetails: async (parent, _args: { data: any }, context) =>
      UpdateQuoteDetails(parent, _args, context),
    acceptProposal: async (parent, _args: { data: any }, context) =>
      acceptProposal(parent, _args, context),
    /* postSales */
    PostRoomwiseXmlApi: async (parent, _args: { data: any }, context) =>
      PostRoomwiseXmlApi(parent, _args, context),
    deleteRoomwise: async (parent, _args: { data: any }, context) =>
      deleteRoomwise(parent, _args, context),
    updateDiscountGeneratePdf: async (parent, _args: { data: any }, context) =>
      updateDiscountGeneratePdf(parent, _args, context),
    updateProjectCommercial: async (parent, _args: { data: any }, context) =>
      updateProjectCommercial(parent, _args, context),
  },
  DateTime: DateTimeResolver,
};
