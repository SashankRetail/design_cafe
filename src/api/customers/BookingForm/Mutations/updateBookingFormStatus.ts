import { prisma } from "../../../../prismaConfig";
import EmailTemplate from "../../../../domain/services/template/EmailTemplate";
import { triggerEmailNotification } from "../../../../domain/services/baseUseCase/baseUseCase";

export const updateBookingFormStatus = async (_root, args, _context) => {
  try {
    const updatedData = await prisma.dc_customer.update({
      where: { customerphone: args.customerphone },
      data: { bookingformstatus: args.bookingformstatus },
    });
    if(updatedData.bookingformstatus.toLowerCase() === "generated"){
      const opportunity = await prisma.opportunity.findFirst({
        where: { sfid: updatedData.opportunityid },
      });
      const sales = await prisma.user.findFirst({
        where: {
          sfid: opportunity.ownerid,
        }
      })
      await callBookingFormGeneratedNotification(
        updatedData.customeremail,
        sales.email
      )
    }
    return {
      code: updatedData ? 200 : 500,
      message: updatedData
        ? "Booking form status updated successfully"
        : "Something went wrong",
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const callBookingFormGeneratedNotification = async (
  customerEmail,
  cc
) => {

  await triggerEmailNotification(
    customerEmail,
    "Your booking form generated",
    EmailTemplate.bookingFormGenerateTemplate(),
    cc
  );
}

