import { prisma } from "../../../../prismaConfig";
import {
  ClearPaymentRequestModel,
  PaymentStatusEnum,
  MicroserviceManualInvoiceRequestModel,
  AddressModel,
  AddOnPaymentObject,
} from "../../../../domain/Requestdata/Paymentmilestoneupdaterequestmodel";
import HttpError from "standard-http-error";
import superagent from "superagent";

export const ClearPaymentConformation = async (root, args, context) => {
  const { milestoneid, projectid } = args;
  const clearpayment = await prisma.dc_paymentmilestone.findFirst({
    where: { id: milestoneid },
  });
  if (!clearpayment) {
    throw new HttpError(201, "No Payment Milestone Found");
  }
  if (!clearpayment.invoicenumber) {
    throw new HttpError(201, "Cannot find Invoice Number");
  }
  const url = `${process.env.apiEndpoint}data-correction/payment-receipt?invoiceNumber=${clearpayment.invoicenumber}`;
  console.log("url", url);
  const invoice = await superagent
    .delete(url)
    .set("Content-Type", "application/json");
  console.log("Invoice:-----", invoice.body);
  if (invoice && invoice.body && invoice.body.statusCode) {
    if (invoice.body.statusCode >= 200 && invoice.body.statusCode < 400) {
      await removePaymentDetails(projectid, clearpayment);
      try {
        await hitMicroserviceAgainToUpdateLatestData(projectid, milestoneid);
      } catch (e) {
        console.log(
          "---hitMicroserviceAgainToUpdateLatestData -------   ERROR from MICROSERVICE:",
          e
        );
      }
    } else {
      console.log("throwing Error from status code");
      throw Error(invoice.body.message);
    }
  }
  return {
    code: 200,
    message: "Success",
  };
};
const removePaymentDetails = async (projectID, clearpaymentdata) => {
  if (clearpaymentdata.id) {
    console.log("2");
    const paymentreceiptdata = await prisma.dc_paymentreceipts.findFirst({
      where: { paymentmillestoneid: clearpaymentdata.id },
    });
    const paymentid = paymentreceiptdata.id;
    await removeAllPaymentConfirmationsObjects(paymentid);
    await prisma.dc_paymentmilestone.update({
      data: {
        amountpaid: 0,
        freezedmodular: 0,
        freezedsiteservice: 0,
        isfreezed: false,
        paymentid: null,
        status: PaymentStatusEnum.PENDING,
        amountdue:
          Number(clearpaymentdata.totalpayableamount) -
          Number(clearpaymentdata.advanceamount),
      },
      where: { id: clearpaymentdata.id },
    });
    let nextPaymentValue = null;
    switch (clearpaymentdata.paymentvalue) {
      case "5%":
        nextPaymentValue = "15%";
        break;
      case "15%":
        nextPaymentValue = "35%";
        break;
      case "35%":
        nextPaymentValue = "45%";
        break;
    }
    console.log("nextPaymentValue", nextPaymentValue);

    if (nextPaymentValue) {
      const projectdata = await prisma.dc_projects.findFirst({
        where: { projectid: projectID },
      });
      const id = projectdata.id;
      const nextPaymentMilestone = await prisma.dc_paymentmilestone.findFirst({
        where: {
          paymentvalue: nextPaymentValue,
          projectid: id,
        },
      });
      console.log("nextPaymentMilestone", nextPaymentMilestone);
      const nextPaymentMilestoneID = nextPaymentMilestone.id;
      const nextPaymentMilestoneData = new ClearPaymentRequestModel();
      const Amountdue: number =
        Number(nextPaymentMilestone.amountdue) +
        Number(nextPaymentMilestone.advanceamount);
      await prisma.dc_paymentmilestone.update({
        data: {
          advanceamount: 0,
          amountdue: Amountdue,
          status: PaymentStatusEnum.PENDING,
        },
        where: { id: nextPaymentMilestoneID },
      });
      console.log(
        "nextPaymentMilestoneUpdatedMilestone",
        nextPaymentMilestoneData
      );
    }
  }
};
const removeAllPaymentConfirmationsObjects = async (paymentid) => {
  console.log("1", paymentid);
  await prisma.dc_paymentreceipts.delete({
    where: { id: paymentid },
  });
};
const hitMicroserviceAgainToUpdateLatestData = async (
  projectid,
  milestoneid
) => {
  const project = await prisma.dc_projects.findFirst({
    where: { projectid: projectid },
  });
  if (!project.customerid) {
    throw new HttpError(201, "Customer Information not found");
  }
  const customerid = project.customerid;
  const customer = await prisma.dc_customer.findFirst({
    where: { customerid: customerid },
  });
  const billingadd = await prisma.dc_addresses.findFirst({
    where: { customerid: customerid },
  });
  const milestone = await prisma.dc_paymentmilestone.findFirst({
    where: {
      id: milestoneid,
    },
  });
  const microserviceRequestData = new MicroserviceManualInvoiceRequestModel();
  microserviceRequestData.invoiceNumber = milestone.invoicenumber;
  microserviceRequestData.customerShippingAddress = customer.projectaddress;
  const billingAddress = new AddressModel();
  billingAddress.country = billingadd.country;
  billingAddress.street = billingadd.street;
  billingAddress.city = billingadd.city;
  billingAddress.ziporpostalcode = billingadd.zip;
  billingAddress.shippingstate = billingadd.state;
  microserviceRequestData.customerName = customer.firstname;
  microserviceRequestData.customerEmail = customer.customeremail;
  microserviceRequestData.customerPhone = customer.customerphone;
  microserviceRequestData.customerBillingaddress = billingAddress;
  microserviceRequestData.projectID = project.projectid;
  microserviceRequestData.projectName = project.projectname;
  microserviceRequestData.projectStatus = `${project.projectstatus}`;
  microserviceRequestData.requestName = "SAVE_INVOICE";
  if (milestone.paymentvalue === "5%") {
    microserviceRequestData.paymentName = `${milestone.paymentvalue} supply of interior works`;
  } else if (milestone.paymentvalue === "100%") {
    microserviceRequestData.paymentName = "deep cleaning";
  } else {
    microserviceRequestData.paymentName = `${milestone.paymentvalue} supply of works`;
  }
  const experienceCenter = await prisma.dc_experiencecenters.findFirst({
    where: { centerid: project.experiencecenterid },
  });
  microserviceRequestData.applicationId = "DESIGNER_DASHBOARD";
  microserviceRequestData.experienceCenter = experienceCenter.name;
  microserviceRequestData.invoiceDate = milestone.invoicedate;
  microserviceRequestData.projectValue = Number(project.totalprojectvalue);
  microserviceRequestData.milestonePendingDue =
    Number(milestone.totalpayableamount) -
    Number(milestone.advanceamount) -
    Number(milestone.amountpaid);
  const milestonestatus = milestone.status;
  microserviceRequestData.paymentStatus = milestonestatus;
  microserviceRequestData.amountPaid = Number(milestone.amountpaid);
  microserviceRequestData.amountDue =
    Number(milestone.totalpayableamount) -
    Number(milestone.advanceamount) -
    Number(milestone.amountpaid);
  if (Number(milestone.addonamount) > 0) {
    const addOnObj = new AddOnPaymentObject();
    addOnObj.amount = Number(milestone.addonamount);
    addOnObj.paymentname = "50% Addon Service";
    addOnObj.quantity = 1;
    microserviceRequestData.extraPayments = [addOnObj];
  }
  console.log("microserviceRequestData:", microserviceRequestData);
  const url = `${process.env.apiEndpoint}designer-dashboard/save-invoice-data`;
  console.log("----------0", url);
  const invoice = await superagent
    .post(url)
    .send(microserviceRequestData)
    .set("Content-Type", "application/json");
  console.log(
    "============================================Invoice: ",
    JSON.stringify(invoice.body)
  );
  if (invoice.body.statusCode !== 200) {
    console.log("invoice.body.message", invoice.body.message);
    throw new HttpError(201, invoice.body.message);
  }
};
const getPaymentStatusName = async (milestonestatus) => {
  let paymentstatus;
  switch (milestonestatus) {
    case PaymentStatusEnum.PAID:
      paymentstatus = "PAID";
      break;
    case PaymentStatusEnum.PARTIAL_PAYMENT:
      paymentstatus = "PARTIALLY_PAID";
      break;
    case PaymentStatusEnum.PENDING:
      paymentstatus = "PENDING";
      break;
  }
  return paymentstatus;
};
