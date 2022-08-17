import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import dayjs from "dayjs";
import superagent from "superagent";
import MicroserviceInvoiceRequestModel, { AddressModel, AddOnPaymentObject } from "../../../../domain/Requestdata/Microserviceinvoicerequestmodel";


export const generateInvoiceOldFlow = async (root, args, context) => {

  const { projectid, milestoneid, isRegenerate } = args;
  const project = await prisma.dc_projects.findFirst({ where: { id: projectid } });
  if (project.customerid === null) {
    throw new HttpError(201, "Customer Information not found");
  } else {
    const milestone = await prisma.dc_paymentmilestone.findFirst({ where: { id: milestoneid } });
    const customer = await prisma.dc_customer.findFirst({ where: { customerid: project.customerid } });
    const address = await prisma.dc_addresses.findFirst({ where: { customerid: customer.customerid } });
    const billingAddressIn = new AddressModel();
    billingAddressIn.country = address.country;
    billingAddressIn.street = address.street;
    billingAddressIn.city = address.city;
    billingAddressIn.zipOrPostalCode = address.zip;
    billingAddressIn.shippingState = address.state;
    const shippingAddressIn = new AddressModel();
    shippingAddressIn.country = address.country;
    shippingAddressIn.street = address.street;
    shippingAddressIn.city = address.city;
    shippingAddressIn.zipOrPostalCode = address.zip;
    shippingAddressIn.shippingState = address.state;

    const microserviceRequestDataInvoice = new MicroserviceInvoiceRequestModel();

    if (milestone.paymentvalue === "5%") {
      microserviceRequestDataInvoice.paymentName = `${milestone.paymentvalue} supply of interior works`;
    } else if (milestone.paymentvalue === "100%") {
      microserviceRequestDataInvoice.paymentName = "deep cleaning";
    } else {
      microserviceRequestDataInvoice.paymentName = `${milestone.paymentvalue} supply of works`;
    }
    microserviceRequestDataInvoice.customerName = customer.firstname;
    microserviceRequestDataInvoice.customerEmail = customer.customeremail;
    microserviceRequestDataInvoice.customerPhone = customer.customerphone;
    microserviceRequestDataInvoice.customerShippingAddress = shippingAddressIn;
    console.log(shippingAddressIn);
    microserviceRequestDataInvoice.customerBillingAddress = billingAddressIn;
    microserviceRequestDataInvoice.projectID = project.projectid;
    microserviceRequestDataInvoice.projectName = project.projectname;
    microserviceRequestDataInvoice.projectStatus = `${project.projectstatus}`;
    microserviceRequestDataInvoice.requestName = "GENERATE_INVOICE";
    if (milestone.paymentvalue === "5%") {
      microserviceRequestDataInvoice.paymentName = `${milestone.paymentvalue} supply of interior works`;
    } else if (milestone.paymentvalue === "100%") {
      microserviceRequestDataInvoice.paymentName = "deep cleaning";
    } else {
      microserviceRequestDataInvoice.paymentName = `${milestone.paymentvalue} supply of works`;
    }
    const experienceCenter = await prisma.dc_experiencecenters.findFirst({ where: { centerid: project.experiencecenterid } })
    microserviceRequestDataInvoice.applicationId = "DESIGNER_DASHBOARD";
    microserviceRequestDataInvoice.invoiceDate = dayjs().format("DD/MM/YYYY")//toUTCFormat
    microserviceRequestDataInvoice.projectValue = Number(project.projectvalue);
    microserviceRequestDataInvoice.amount = Number(milestone.modularamount);
    microserviceRequestDataInvoice.experienceCenter = experienceCenter.name;
    microserviceRequestDataInvoice.milestonePendingDue = Number(milestone.amountdue);
    if (milestone.invoicenumber) {
      microserviceRequestDataInvoice.invoiceNumber = milestone.invoicenumber;
    }
    microserviceRequestDataInvoice.invoiceNumber = "null";
    microserviceRequestDataInvoice.projectModularValue = Number(
      project.modularvalue
    );
    microserviceRequestDataInvoice.projectDecorValue = Number(
      project.decorvalue
    );
    microserviceRequestDataInvoice.projectSiteServicesValue = Number(
      project.siteservicevalue
    );
    if (Number(milestone.addonamount) > 0) {
      const addOnObj = new AddOnPaymentObject();
      addOnObj.amount = Number(milestone.addonamount);
      addOnObj.paymentName = "50% Addon Service";
      addOnObj.quantity = 1;
      microserviceRequestDataInvoice.extraPayments = [addOnObj];
    }

    if (isRegenerate) {
      microserviceRequestDataInvoice.requestName = "REGENERATE_INVOICE";
      microserviceRequestDataInvoice.invoiceNumber = milestone.invoicenumber;
      microserviceRequestDataInvoice.invoiceDate = dayjs(milestone.invoicedate).format("DD/MM/YYYY");
    }

    microserviceRequestDataInvoice.paymentMilestoneID = milestoneid;
    const url = `${process.env.apiEndpoint}generateInvoice`;
    console.log(url);
    const invoice = await superagent
      .post(url)
      .send({ invoiceData: microserviceRequestDataInvoice })
      .set("Content-Type", "application/json");
    console.log(
      "============================================Invoice: ",
      JSON.stringify(invoice.body)
    );
    if (invoice.body.statusCode !== 200) {
      throw new HttpError(201, invoice.body.message);
    }
    if (!invoice.body.data.invoice) {
      throw new HttpError(201, "Invalid Microservice response body");
    }

    const microserviceResponse = invoice.body.data.invoice;

    let totalExtraPayment = 0;
    if (microserviceResponse.extraPaymentsInvoiceBreakup) {
      microserviceResponse.extraPaymentsInvoiceBreakup.forEach((element) => {
        totalExtraPayment = totalExtraPayment + element.totalAmount;
      });
    }
    const updatedMilestone = await prisma.dc_paymentmilestone.update({
      data: {
        invoicebaseamount: microserviceResponse.invoiceBreakUp.baseAmount,
        invoicenumber: microserviceResponse.invoiceNumber,
        invoicetotalamount: microserviceResponse.invoiceBreakUp.totalAmount + totalExtraPayment,
        invoicetotaltaxamount: microserviceResponse.invoiceBreakUp.totalTaxValue,
        invoicetotalcgstaxamount: microserviceResponse.invoiceBreakUp.CGST,
        invoicetotalsgsttaxamount: microserviceResponse.invoiceBreakUp.SGST,
        invoicetotaligsttaxamount: microserviceResponse.invoiceBreakUp.IGST,
        invoicedate: microserviceResponse.invoiceDate,
        invoiceurl: microserviceResponse.invoicePdf,
        paymentlink: invoice.body.data.invoice.paymentLink,
        paymentlinkid: invoice.body.data.invoice.paymentlinkid,
        rpayorderid: invoice.body.data.invoice.rpayorderid,
        receiptid: invoice.body.data.invoice.receiptid
      },
      where: { id: milestoneid }
    });

    return {
      data: updatedMilestone,
      message: "success",
      code: 200
    }
  }

}
