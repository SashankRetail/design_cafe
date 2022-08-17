import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";
import httpError from "standard-http-error";
import { prisma } from "../../../../prismaConfig";
import { BookingFormStatusEnumNames } from "../../../../domain/enumerations/ChangeRequestEnums";
import superagent from "superagent";
import dayjs from "dayjs";
import EmailTemplate from "../../../../domain/services/template/EmailTemplate";
import { triggerEmailNotification } from "../../../../domain/services/baseUseCase/baseUseCase";

export const acceptBookingForm = async (_root, args, _context) => {
  try {
    const customer = await authenticate(_context, "CD");
    const opportunity = await prisma.opportunity.findFirst({
      where: { sfid: customer.opportunityid },
    });
    const account = await prisma.account.findFirst({
      where: {
        sfid: opportunity.accountid,
      },
    });
    const sales = await prisma.user.findFirst({
      where: {
        sfid: opportunity.ownerid,
      },
    });
    if (!opportunity) {
      return {
        code: 400,
        message: "Opportunity not found",
      };
    }
    const customerObj = {};
    if (args.isEdit) {
      const data = {};
      if (args.currentAddress) {
        data["billingcity"] = args.currentAddress.city;
        data["billingstreet"] = args.currentAddress.street;
        data["billingstate"] = args.currentAddress.shippingState;
        data["billingpostalcode"] = args.currentAddress.zipOrPostalCode;
        data["billingcountry"] = args.currentAddress.country;
        customerObj["currentaddress"] = args.currentAddress;
        await updateAccount(
          data,
          customerObj,
          opportunity.accountid,
          customer.customerid
        );
      }
      if (args.projectAddress) {
        data["shippingcity"] = args.projectAddress.city;
        data["shippingpostalcode"] = args.projectAddress.zipOrPostalCode;
        data["shippingstreet"] = args.projectAddress.street;
        data["shippingstate"] = args.projectAddress.shippingState;
        data["shippingcountry"] = args.projectAddress.country;
        customerObj["projectaddress"] = args.projectAddress;
        await updateAccount(
          data,
          customerObj,
          opportunity.accountid,
          customer.customerid
        );
      }
      return {
        code: 200,
        message: `Successfully updated details`,
      };
    } else {
      if (
        !args.dcCode ||
        !args.pan ||
        !args.currentAddress ||
        !args.projectAddress
      ) {
        throw new httpError(400, "Argument missing. Please check payload");
      }
      const bookingformdate =
        customer.bookingformaccepteddate !== null
          ? dayjs(customer.bookingformaccepteddate).format("DD-MM-YYYY")
          : dayjs(new Date()).format("DD-MM-YYYY");
      const pdfargs = {
        modularAmount: opportunity.modular_amount_dis_incl_gst__c,
        dcCode: opportunity.customer_id__c,
        closeDate: bookingformdate,
        clientName: account.name,
        phoneNumber: account.personmobilephone,
        emailId: account.personemail,
        projectType: opportunity.home_type__c,
        scopeOfWork: opportunity.scope_of_work__c,
        civilWorkRequired: opportunity.civil_work__c,
        currentAddress: args.currentAddress,
        projectAddress: args.projectAddress,
        proposedValue: opportunity.proposed_budget__c,
        signupValue: opportunity.amount,
        modularDiscount: opportunity.modular_discount__c,
        siteServicesDiscount: opportunity.civil_discount__c,
        siteServicesAmount: opportunity.site_services_amount_dis_incl_gst__c,
        decorAmount: opportunity.decor_amount_incl_gst__c,
        fivePercentageProjectValue: opportunity.initial_payment__c,
        signupAmount: opportunity.signup_amount__c,
        basicFramesofExternalDoorsAndWindows:
          opportunity.frames_for_all_external_doors_windows__c,
        reqdDoorsAndWindowsInstalled:
          opportunity.the_doors_windows_are_installed_requir__c,
        basicAllWallsCompleted: opportunity.all_walls_are_completed_required__c,
        reqdPuttyCoatOfPlasteringOnWalls:
          opportunity.putty_and_1_coat_of_plastering_required__c,
        basicFloorsLeveledOutAndPrepped:
          opportunity.floors_are_levelled_out_prepped_basic__c,
        reqdFlooringIsCompleted: opportunity.flooring_is_completed_required__c,
        notes: opportunity.notes__c,
        pan: args.pan,
        gst: args.gst,
        wohooCard: opportunity.wohoo_card__c,
        remarkFromSales: opportunity.remarks_for_marketing__c,
        salesManagerName: sales.name,
        salesManagerMobile: sales.mobilephone,
        salesManagerEmail: sales.email,
        leadId: opportunity.lead_id__c,
        customerId: customer.customerid,
      };
      const response = await superagent
        .put(`${process.env.PDFGENERATE}/generateBookingFormPdf`)
        .send(pdfargs)
        .set("Content-Type", "application/json");
      customerObj["bookingformpdf"] = response?._body?.data?.Location;
      customerObj["bookingformaccepted"] = true;
      customerObj["bookingformstatus"] = BookingFormStatusEnumNames.ACCEPTED;
      customerObj["bookingformaccepteddate"] = new Date();
      const updatedCustomerData = await prisma.dc_customer.update({
        where: { customerid: customer.customerid },
        data: customerObj,
      });
      console.log("user === > ", updatedCustomerData);
      const data = {
        update_booking_form__c: true,
      };
      await prisma.opportunity.update({
        where: { sfid: updatedCustomerData.opportunityid },
        data: data,
      });

      /******************* Notification ******************/

      const attachments = [
        {
          filename: response._body.data.key,
          path: response._body.data.location,
        },
      ];

      await callBookingFormAcceptNotification(
        customer.customeremail,
        [sales.email, process.env.dcAdminLegalEmail],
        attachments
      );
      return { code: 200, message: "Successfully accepted booking form" };
    }
  } catch (error) {
    console.log(107107, error);
    throw error;
  }
};
const updateAccount = async (data, obj, accountid, customerid) => {
  await prisma.account.update({
    where: { sfid: accountid },
    data: data,
  });
  await prisma.dc_customer.update({
    where: { customerid: customerid },
    data: obj,
  });
};
const callBookingFormAcceptNotification = async (
  customerEmail,
  cc,
  attachments
) => {
  await triggerEmailNotification(
    customerEmail,
    "Booking form accepted",
    EmailTemplate.bookingFormAcceptTemplate(),
    cc,
    attachments
  );
};
