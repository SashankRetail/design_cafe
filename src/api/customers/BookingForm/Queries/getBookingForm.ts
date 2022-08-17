import { prisma } from "../../../../prismaConfig";
import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";

export const getBookingForm = async (_root, args, _context) => {
  let getBookingFormResponseObj;
  try {
    const customer = await authenticate(_context, "CD");
    const opportunity = await prisma.opportunity.findFirst({
      where: { sfid: customer.opportunityid },
    });
    const quote = await prisma.quote.findFirst({
      where: {
        opportunityid: opportunity.sfid,
      },
    });
    const acc = await prisma.account.findFirst({
      where: {
        sfid: opportunity.accountid,
      },
    });
    const sales = await prisma.user.findFirst({
      where: {
        sfid: opportunity.ownerid,
      },
    });
    const bookingformstatus = await prisma.dc_customer.findFirst({
      where: {
        customerphone: opportunity.mobile__c,
      },
    });
    getBookingFormResponseObj = {
      code: 200,
      message: "Successfully fetched booking form details",
      user_details: acc,
      opportunity_details: opportunity,
      quote_details: quote,
      sales_manager_details: sales,
      bookingformstatus: bookingformstatus,
    };
    return getBookingFormResponseObj;
  } catch (error) {
    getBookingFormResponseObj = { code: 400, message: error.message };
    return getBookingFormResponseObj;
  }
};
