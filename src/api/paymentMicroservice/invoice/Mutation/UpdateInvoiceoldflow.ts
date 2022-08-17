import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import { PaymentStatusEnum, MicroserviceManualInvoiceRequestModel, AddressModel } from "../../../../domain/Requestdata/Paymentmilestoneupdaterequestmodel";
import superagent from "superagent";

export const UpdateInvoiceOldFlow = async (root, args, context) => {
  const { projectid, milestoneid, invoicedate, invoiceamount } = args;
  const project = await prisma.dc_projects.findFirst({
    where: { id: projectid }
  });
  if (project.customerid === null) {
    throw new HttpError(201, "Customer Information not found");
  }
  const customerid = project.customerid;
  const customer = await prisma.dc_customer.findFirst({
    where: { customerid: customerid }
  })
  const milestone = await prisma.dc_paymentmilestone.findFirst({
    where: { id: milestoneid }
  });
  const billingadd = await prisma.dc_addresses.findFirst({
    where: { customerid: customerid }
  });
  const microserviceRequestDataResponse = new MicroserviceManualInvoiceRequestModel();
  microserviceRequestDataResponse.invoicenumber = milestone.invoicenumber;
  microserviceRequestDataResponse.customershippingaddress = customer.projectaddress;
  const billingAddress = new AddressModel();
  billingAddress.country = billingadd.country;
  billingAddress.street = billingadd.street;
  billingAddress.city = billingadd.city;
  billingAddress.ziporpostalcode = billingadd.zip;
  billingAddress.shippingstate = billingadd.state;
  microserviceRequestDataResponse.firstname = customer.firstname;
  microserviceRequestDataResponse.customeremail = customer.customeremail;
  microserviceRequestDataResponse.customerphone = customer.customerphone;
  microserviceRequestDataResponse.customerbillingaddress = billingAddress;
  microserviceRequestDataResponse.projectid = project.projectid;
  microserviceRequestDataResponse.projectname = project.projectname;
  microserviceRequestDataResponse.projectstatus = `${project.projectstatus}`;
  microserviceRequestDataResponse.requestname = "SAVE_INVOICE";
  let paymentName;
  if (milestone.paymentvalue === "5%") {
    paymentName = `${milestone.paymentvalue} supply of interior works`;
  } else if (milestone.paymentvalue === "100%") {
    paymentName = "deep cleaning";
  } else {
    paymentName = `${milestone.paymentvalue} supply of works`;
  }
  microserviceRequestDataResponse.paymentname = paymentName;
  microserviceRequestDataResponse.applicationid = "DESIGNER_DASHBOARD";
  microserviceRequestDataResponse.invoicedate = invoicedate;
  microserviceRequestDataResponse.projectvalue = Number(project.totalprojectvalue);
  microserviceRequestDataResponse.amount = Number(invoiceamount);
  microserviceRequestDataResponse.milestonependingdue =
    Number(invoiceamount) - Number(milestone.amountpaid);
  const milestonestatus = milestone.status
  microserviceRequestDataResponse.paymentstatus = getPaymentStatusName(milestonestatus);
  microserviceRequestDataResponse.amountpaid = Number(milestone.amountpaid);
  microserviceRequestDataResponse.amountdue =
    Number(invoiceamount) - Number(milestone.amountpaid);
  const url = `${process.env.apiEndpoint}designer-dashboard/save-invoice-data`;
  console.log("MICRO SERVICE URL==========>>>>>", url);
  const invoice = await superagent
    .post(url)
    .send(microserviceRequestDataResponse)
    .set("Content-Type", "application/json");
  if (invoice.body.statusCode !== 200) {
    throw new HttpError(201, invoice.body.message);
  }
  const microserviceResponse = invoice.body.data;
  const totalAmount = microserviceResponse.invoicebreakup.totalamount;
  const milestoneDueAmount: number = Number(totalAmount) - Number(milestone.amountpaid) -
    Number(milestone.advanceamount);
  let isfreezed;
  let Status;
  if (milestoneDueAmount > 0) {
    isfreezed = false;
    Status = "PARTIALLY_PAID";
  } else {
    isfreezed = true;
    Status = "PAID";
  }
  if (Number(milestone.amountpaid) === 0) {
    Status = "PENDING";
  }
  const updatedMilestone = await prisma.dc_paymentmilestone.update({
    data: {
      invoicebaseamount: microserviceResponse.invoicebreakup.baseamount,
      invoicetotalamount: microserviceResponse.invoicebreakup.totalamount,
      invoicetotaltaxamount: microserviceResponse.invoicebreakup.totaltaxvalue,
      invoicetotalcgstaxamount: microserviceResponse.invoicebreakup.cgst,
      invoicetotalsgsttaxamount: microserviceResponse.invoicebreakup.sgst,
      invoicetotaligsttaxamount: microserviceResponse.invoicebreakup.igst,
      invoicedate: microserviceResponse.invoicedate,
      totalpayableamount: microserviceResponse.invoicebreakup.totalamount,
      amountdue: milestoneDueAmount,
      isfreezed: isfreezed,
      status: Status
    },
    where: { id: milestoneid }
  });
  console.log(updatedMilestone);
  return {
    data: updatedMilestone,
    message: "success",
  }
}
const getPaymentStatusName = async (milestonestatus) => {
  let status;
  switch (milestonestatus) {
    case PaymentStatusEnum.PAID:
      status = "PAID";
      break;
    case PaymentStatusEnum.PARTIAL_PAYMENT:
      status = "PARTIALLY_PAID";
      break;
    case PaymentStatusEnum.PENDING:
      status = "PENDING";
      break;
  }
  return status;
}
