import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import { XmlToPdf } from "../../../../domain/services/baseUseCase/baseUseCase";

export const UpdateQuoteDetails = async (_root, args, _context) => {
  try {
    const QuoteResponse = await prisma.quote.findFirst({
      where: {
        sfid: args.quoteId,
        opportunityid: args.opportunityId,
      },
    });

    if (!QuoteResponse) {
      throw new HttpError(400, "Quote not found");
    }
    const QuoteResponseObj = {};
    const opportunity = await prisma.opportunity.findFirst({
      where: { sfid: args.opportunityId },
    });
    if (!opportunity) {
      throw new HttpError(400, "Opportunity not found");
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
    if (args.updateModular) {
      if (args.modularDiscount === null || args.modularFixedDiscount === null) {
        return {
          code: 400,
          message: "Please provide modular percentage & fixed discounts",
        };
      }
      QuoteResponseObj["modular_discount__c"] = args.modularDiscount;
      QuoteResponseObj["modular_fixed_discount__c"] = args.modularFixedDiscount;
      const xmlModularObj = {
        from: "Sales Force",
        file: args.modulerXmlLink,
        type: "modularXml",
        discount: args.modularDiscount ? args.modularDiscount : 0,
        absoluteDiscount: args.modularFixedDiscount
          ? args.modularFixedDiscount
          : 0,
        customerId: custId,
        opportunityId: args.opportunityId,
        isPmFeeIncluded: opportunity.is_pm_site__c,
        cityPmFee: city.includepmfee,
        leadid: opportunity.lead_id__c,
        displayname: "Modular Quotation",
      };
      /* Function that generated pdf from xml */
      const forModular = await XmlToPdf(xmlModularObj);
      QuoteResponseObj["quote_link__c"] = forModular.s3Location;
    }
    if (args.updateSiteService) {
      if (
        args.siteServiceDiscount === null ||
        args.siteServiceFixedDiscount === null
      ) {
        return {
          code: 400,
          message: "Please provide site service percentage & fixed discounts",
        };
      }
      QuoteResponseObj["site_services_discount__c"] = args.siteServiceDiscount;
      QuoteResponseObj["site_service_fixed_discount__c"] =
        args.siteServiceFixedDiscount;
      const xmlSiteServiceObj = {
        from: "Sales Force",
        file: args.siteServiceXmlLink,
        type: "siteServiceXml",
        discount: args.siteServiceDiscount ? args.siteServiceDiscount : 0,
        absoluteDiscount: args.siteServiceFixedDiscount
          ? args.siteServiceFixedDiscount
          : 0,
        customerId: custId,
        opportunityId: args.opportunityId,
        isPmFeeIncluded: opportunity.is_pm_site__c,
        cityPmFee: city.includepmfee,
        leadid: opportunity.lead_id__c,
        displayname: "Site Service Quotation",
      };
      /* Function that generated pdf from xml */
      const forSiteService = await XmlToPdf(xmlSiteServiceObj);
      QuoteResponseObj["site_services_pdf__c"] = forSiteService.s3Location;
    }
    //  Update data in salesforce.
    QuoteResponseObj["latest_quote__c"] = true;
    const dataToSF = await prisma.quote.update({
      where: {
        sfid: args.quoteId,
      },
      data: QuoteResponseObj,
    });
    return {
      code: dataToSF.id ? 200 : 400,
      message: dataToSF.id ? "Updated successfully" : "Something went wrong",
      data: dataToSF.id,
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error);
  }
};
