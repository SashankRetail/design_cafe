import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import { XmlToPdf } from "../../../../domain/services/baseUseCase/baseUseCase";

export const saveBetaQuoteApi = async (_root, args, _context) => {
  try {
    if (!args.modulerXmlLink) {
      throw new HttpError(400, "Modular xml is mandatory");
    }
    const quoteData = await prisma.quote.findFirst({
      where: { postgres_id__c: args.postgresId },
    });
    if (!quoteData) {
      return {
        code: 400,
        message: "Quote not found",
      };
    }
    // Populating object to save data into quotes collection.
    const dbQuoteObj: any = {
      name: args.name,
      modular_amount__c: args.modularAmount ? args.modularAmount : 0,
      site_services_amount__c: args.siteServiceValue
        ? args.siteServiceValue
        : 0,
      modular_discount__c: args.modularDiscount ? args.modularDiscount : 0,
      site_services_discount__c: args.siteServiceDiscount
        ? args.siteServiceDiscount
        : 0,
      latest_quote__c: true,
      dc_modular_xml__c: args.modulerXmlLink,
      ...(args.siteServiceXmlLink && {
        dc_site_services_xml__c: args.siteServiceXmlLink,
      }),
      sfid: args.quoteId,
      opportunityid: args.opportunityId,
      proposal_pdf__c: args.proposalLocation,
      dc_room_list__c: "",
      is_imos_project__c: true,
    };

    const opportunity = await prisma.opportunity.findFirst({
      where: { sfid: args.opportunityId },
    });
    if (!opportunity) {
      return {
        code: 400,
        message: "Opportunity not found",
      };
    }
    const city = await prisma.dc_cities.findFirst({
      where: {
        name: opportunity.region__c,
      },
    });
    if (!city) {
      throw new HttpError(400, "City not found");
    }
    const custId = opportunity.customer_id__c;
    const roomListArray = [];
    if (args.modulerXmlLink) {
      const xmlModularObj = {
        file: args.modulerXmlLink,
        type: "modularXml",
        discount: args.modularDiscount ? args.modularDiscount : 0,
        customerId: custId,
        opportunityId: args.opportunityId,
        isPmFeeIncluded: opportunity.is_pm_site__c,
        cityPmFee: city.includepmfee,
        leadid: opportunity.lead_id__c,
        displayname: "Modular Quotation",
      };
      /* Function that generated pdf from xml */
      const forModular = await XmlToPdf(xmlModularObj);
      roomListArray.push(...forModular.roomList);
      dbQuoteObj.quote_link__c = forModular.s3Location;
    }

    if (args.siteServiceXmlLink) {
      const xmlSiteServiceObj = {
        file: args.siteServiceXmlLink,
        type: "siteServiceXml",
        discount: args.siteServiceDiscount ? args.siteServiceDiscount : 0,
        customerId: custId,
        opportunityId: args.opportunityId,
        isPmFeeIncluded: opportunity.is_pm_site__c,
        cityPmFee: city.includepmfee,
        leadid: opportunity.lead_id__c,
        displayname: "Site Service Quotation",
      };
      /* Function that generated pdf from xml */
      const forSiteService = await XmlToPdf(xmlSiteServiceObj);
      roomListArray.push(...forSiteService.roomList);
      dbQuoteObj.site_services_pdf__c = forSiteService.s3Location;
    }
    dbQuoteObj.dc_room_list__c = JSON.stringify(roomListArray);

    await prisma.quote.update({
      where: { postgres_id__c: args.postgresId },
      data: dbQuoteObj,
    });

    return {
      code: 200,
      message: "Details uploaded successfully",
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error);
  }
};
