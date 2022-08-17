import { prisma } from "../../../../prismaConfig";
import PaymentCategoryEnum from "../../../../domain/enumerations/PaymentCategoryEnum";
import HttpError from "standard-http-error";
import superagent from "superagent";
import CreatePayMiInvoice from "../../../../domain/Requestdata/Invoicegenerationrequestmodel";
export const CalculateInvoicenewflow = async (root, args, context) => {
  const { category, clientid, milestoneName } = args;
  let baseAmount;
  const additionalCharge = 0;
  const defaultStatus = "Draft";
  const Invoice = await prisma.dc_odooinvoice.findFirst({
    where: {
      category: category,
      clientid: clientid,
      milestone: milestoneName,
    },
  });
  if (Invoice) {
    return {
      code: 200,
      message: "Invoice Already available",
      data: Invoice
    }
  } else {
    const project = await prisma.dc_projects.findFirst({
      where: {
        projectid: clientid
      }
    });
    const invoicecalculatedAmount = await calculateInvoiceAmount(category, milestoneName, project)
    baseAmount = Math.floor((invoicecalculatedAmount * 100) / 118);
    const payMiRequestObj = new CreatePayMiInvoice();
    payMiRequestObj.milestone = milestoneName;
    payMiRequestObj.clientID = clientid;
    payMiRequestObj.category = category;
    payMiRequestObj.currentProjectValue = project.totalprojectvalue;
    payMiRequestObj.currentModularValue = project.projectmodularvalue;
    payMiRequestObj.currentSiteServicesValue = project.projectsiteservicesvalue;
    payMiRequestObj.baseAmount = baseAmount;
    payMiRequestObj.additionalCharge = additionalCharge;
    payMiRequestObj.status = defaultStatus;

    const paymiRes = await getPaymiConnection();
    const authToken = paymiRes.accessToken;
    console.log(payMiRequestObj);
    const url = process.env.apiEndpoint + "generateNewProjectInvoice";
    const payMiResponse = await superagent
      .post(url)
      .send({ invoiceData: payMiRequestObj })
      .set("Content-Type", "application/json")
      .set("Authorization", authToken)

    console.log(payMiResponse.body);
    if (payMiResponse.body.statusCode !== 200) {
      throw new HttpError(201, payMiResponse.body.message);
    }
    if (!payMiResponse.body.data.invoiceId) {
      throw new HttpError(201, "Invalid Microservice response body");
    }
    return {
      code: 200,
      message: "Invoice amount generated successfully",
      data: invoicecalculatedAmount,
    }
  }
}
const calculateInvoiceAmount = async (category, mileStone, project) => {
  let totalAmount: number;
  if (category.toLowerCase() === PaymentCategoryEnum.MODULAR) {
    totalAmount = project.projectmodularvalue;
    let milestoneAmountValue: number;
    if (mileStone === "15%") {
      milestoneAmountValue = (totalAmount * 20) / 100;
    } else if (mileStone === "35%") {
      milestoneAmountValue = (totalAmount * 55) / 100;
    } else if (mileStone === "45%") {
      milestoneAmountValue = totalAmount;
    } else {
      throw new HttpError(201, "Modular MileStone Mismatch");
    }
    const invoiceAmount = await calculateFinalAmount(category, project);
    return milestoneAmountValue - invoiceAmount;
  } else if (category.toLowerCase() === PaymentCategoryEnum.SITE_SERVICE) {
    totalAmount = project.projectsiteservicesvalue;
    let milestoneAmountValue: number;
    if (mileStone === "45%") {
      milestoneAmountValue = (totalAmount * 50) / 100;
    } else if (mileStone === "50%") {
      milestoneAmountValue = totalAmount;
    } else {
      throw new HttpError(201, "Site Services MileStone Mismatch");
    }
    const invoiceAmount = await calculateFinalAmount(category, project);
    return milestoneAmountValue - invoiceAmount;
  } else {
    throw new HttpError(201, "Payment Category Mismatch");
  }
}
const calculateFinalAmount = async (category, project) => {
  let invoiceAmount = 0;
  const invoices = await prisma.dc_odooinvoice.findMany({
    where: {
      category: category,
      clientid: project.projectid,
    }
  });
  if (invoices) {
    for (const invoice of invoices) {
      console.log(invoice);
      invoiceAmount = invoiceAmount + invoice.invoiceamount;
    }
  }
  return invoiceAmount;

}

const getPaymiConnection = async () => {
  const finalUrl = process.env.apiEndpoint + "authenticate"
  console.log(finalUrl);
  const reqBody = {
    clientId: process.env.CDClientId
  }
  try {
    const res = await superagent
      .post(finalUrl)
      .set("Content-Type", "application/json")
      .send(reqBody);
    return res.body;
  } catch (error) {
    console.log(error)
    throw error;
  }
}
