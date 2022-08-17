import { prisma } from "../../../prismaConfig";
import { authenticateDdCd } from "../../../core/authControl/verifyAuthUseCase";

export const getQuotation = async (_root, _args, context) => {
  let quoteResponseObj;
  try {
    const res = await authenticateDdCd(context);
    const { opportunitysfid } = _args;
    let opportunity;
    if (res.user) {
      if (!opportunitysfid) {
        return { code: 400, message: "opportunitysfid is required" };
      }

      opportunity = await prisma.opportunity.findFirst({
        where: { sfid: opportunitysfid },
      });
    } else if (res.customer) {
      opportunity = await prisma.opportunity.findFirst({
        where: { mobile__c: res.customer.customerphone },
      });
    }
    let quotes;
    if (opportunity) {
      quotes = await prisma.quote.findMany({
        where: {
          opportunityid: opportunity.sfid,
        },
        orderBy: [
          {
            createddate: 'asc',
          },
        ]
      });
    }

    quoteResponseObj = { code: 200, message: "success", quotes: quotes };
    return quoteResponseObj;
  } catch (error) {
    quoteResponseObj = { code: 400, message: error.message };
    return quoteResponseObj;
  }
};
