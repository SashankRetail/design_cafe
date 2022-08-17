import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import dayjs from "dayjs";
import superagent from "superagent";
import { v4 as uuidv4 } from "uuid";
import { getConnection } from "../../../../domain/services/baseUseCase/baseUseCase";
export const postBetaQuote = async (_root, args, _context) => {
  try {
    const date = dayjs().format("YYYY-MM-DD");
    const quoteData = await prisma.quote.findFirst({
      where: { opportunityid: args.opportunityid },
    });
    if (!quoteData) {
      await updateOpportunityDetails(args.opportunityid, date);
    }
    const oppData = await prisma.opportunity.findFirst({
      where: {
        sfid: args.opportunityid,
      },
    });
    if (!oppData) {
      return {
        code: 400,
        message: "Opportunity not found",
      };
    }
    if (oppData.stagename === "Closed Won") {
      return {
        code: 400,
        message: "Cannot update closed won lead / opportunity",
      };
    }
    const quote = await prisma.quote.create({
      data: {
        opportunityid: args.opportunityid,
        name: args.name,
        modular_fixed_discount__c: args.modularFixedDiscount
          ? args.modularFixedDiscount
          : 0,
        modular_amount__c: args.modularAmount ? args.modularAmount : 0,
        modular_discount__c: args.modularDiscount ? args.modularDiscount : 0,
        site_services_amount__c: args.siteServiceValue
          ? args.siteServiceValue
          : 0,
        site_services_discount__c: args.siteServiceDiscount
          ? args.siteServiceDiscount
          : 0,
        site_service_fixed_discount__c: args.siteServiceFixedDiscount
          ? args.siteServiceFixedDiscount
          : 0,
        decor_amount__c: 0,
        decor_amount_discount__c: 0,
        latest_quote__c: true,
        proposal_pdf__c: args.proposal_link,
        postgres_id__c: uuidv4(),
      },
    });
    console.log(quote);

    await prisma.dc_attachments.create({
      data: {
        filekey: args.key,
        location: args.proposal_link,
        contenttype: args.contentType,
        ispreorpost: 0,
        leadid: oppData.lead_id__c
      }
    })
    return {
      code: 200,
      message: "Quote Added Scuccessfully",
      quoteid: quote.postgres_id__c,
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(400, error);
  }
};

async function updateOpportunityDetails(oppoId, date): Promise<any> {
  try {
    console.log({
      where: { sfid: oppoId },
      data: { proposal_sent_date__c: date },
    });

    const updatedResponse =
      await prisma.$executeRaw`UPDATE public.opportunity SET proposal_sent_date__c = TO_DATE(${date}, 'YYYY/MM/DD') WHERE sfid = ${oppoId};`;
    console.log(updatedResponse);
    return {
      code: 200,
      message: "Updated success",
    };
  } catch (e) {
    console.log(21365, e);
    throw new HttpError(400, "Something went wrong");
  }
}

async function postDatatoSalesForce(reqBody): Promise<any> {
  const conn = await getConnection();
  const finalUrl = `${process.env.salesforceLoginUrl}services/data/v42.0/sobjects/Quote`;
  try {
    const res = await superagent
      .post(finalUrl)
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + conn.accessToken)
      .send(reqBody);
    return res.body;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
