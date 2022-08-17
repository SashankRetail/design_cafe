import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import PaymentModeEnum from "../../../../domain/enumerations/PaymentModeEnum";
import {
  AddPaymentReceiptRequestData, CaptureManualPaymentModel, MilestoneUpdateRequestModel,
  PaymentStatusEnum, ProjectUpdateRequestModel
} from "../../../../domain/Requestdata/Paymentmilestoneupdaterequestmodel";
import superagent from "superagent";
import short from 'shortid';
import { UploadFileOnS3,triggerEmailNotification } from "../../../../domain/services/baseUseCase/baseUseCase"
import {
  callExternalAPIWithPost,
  queryForFetchingRemindersTemplate,
} from "../../../../utils/commonUtils";

export const AddPaymentConformation = async (root, args, context) => {
  let attachmentURL;
  const { transcationid, projectid, receivedamount, modeofpayment, receiveddate, attachment, milestoneid } = args;
  let addPaymentconformationResponseObj;
  const duplicateRecord = await prisma.dc_paymentreceipts.findFirst({ where: { transactionid: transcationid } })
  console.log(duplicateRecord);
  if (!duplicateRecord) {
    if (
      modeofpayment === PaymentModeEnum.CASH &&
      Number(receivedamount) >= 200000
    ) {
      console.log(92)
      throw new HttpError(
        201,
        "Cash Payment not allowed for more than Rs 1,99,999"
      );
    }
    const project = await prisma.dc_projects.findFirst({ where: { projectid: projectid } })
    console.log("project", project);
    const milestone = await prisma.dc_paymentmilestone.findFirst({ where: { id: milestoneid } });
    const AddPaymentReceiptRequest = new AddPaymentReceiptRequestData();
    if (attachment) {
      const attachmentFile = {
        key: attachment.fileName,
        contentType: attachment.contentType,
        base64: attachment.fileBase64,
      };
      const fileObj = await UploadFileOnS3(attachmentFile)
      AddPaymentReceiptRequest.supportingDocumentURL = fileObj.Location;
      AddPaymentReceiptRequest.awsSupportingDocumentURLKey = fileObj.key;
    }

    const customer = await prisma.dc_customer.findFirst({
      where: { customerid: project.customerid }
    });
    console.log(customer);
    if (
      modeofpayment === PaymentModeEnum.CASH ||
      modeofpayment === PaymentModeEnum.IMPS ||
      modeofpayment === PaymentModeEnum.NEFT ||
      modeofpayment === PaymentModeEnum.CHEQUE
    ) {
      const updatepaymentlinkargs =
      {
        project, milestone, customer,
        receivedamount, receiveddate, transcationid, modeofpayment, attachmentURL
      };
      const updatedPaymentLink = await captureManualPaymentOnMicroservice(updatepaymentlinkargs);
      await prisma.dc_paymentmilestone.update({
        data: {
          paymentlink: updatedPaymentLink
        },
        where: { id: milestoneid }
      });

    }
    let advanceForNextMilestone = 0;
    const updatedAmountPaidValue = Number(milestone.amountpaid) + Number(receivedamount);
    if (updatedAmountPaidValue > Number(milestone.totalpayableamount)) {
      advanceForNextMilestone = updatedAmountPaidValue - Number(milestone.totalpayableamount);
      console.log("advanceForNextMilestone", advanceForNextMilestone);
    }
    await prisma.dc_paymentmilestone.update({
      data: {
        amountpaid: Math.floor(updatedAmountPaidValue)
      },
      where: { id: milestoneid }
    });
    const updatedAmountDue = Number(milestone.totalpayableamount) - updatedAmountPaidValue - Number(milestone.advanceamount);
    await prisma.dc_paymentmilestone.update({
      data: {
        amountdue: updatedAmountDue
      },
      where: { id: milestoneid }
    });
    if (updatedAmountDue <= 5) {
      await prisma.dc_paymentmilestone.update({
        data: {
          freezedmodular: milestone.modularamount,
          isfreezed: true,
          status: PaymentStatusEnum.PAID
        },
        where: { id: milestoneid }
      });
    } else {
      await prisma.dc_paymentmilestone.update({
        data: {
          status: PaymentStatusEnum.PARTIAL_PAYMENT
        },
        where: { id: milestoneid }
      });
    }
    console.log(264264, project, project.achievedrevenuevalue);
    const projectUpdateModel = new ProjectUpdateRequestModel();
    const Id = short.generate();
    const paymentId = Id;
    const res1 = await prisma.dc_paymentreceipts.findFirst({
      where: { transactionid: transcationid }
    });
    console.log(res1);

    const res = await prisma.dc_paymentreceipts.update({
      data: {
        paymentname: milestone.paymentvalue,
        receivedamount: receivedamount,
        paymentreceiveddate: receiveddate,
        paymentid: "PIO-" + paymentId,
        paymentmillestoneid: milestoneid,
        projectid: projectid,
        clientid: projectid
      },
      where: { id: res1.id }
    });
    console.log("paymentconformationdata", res);
    await prisma.dc_projects.update({
      data: {
        achievedrevenuevalue: Math.floor(Number(project.achievedrevenuevalue) + Number(receivedamount)),
        pendingamountvalue: Math.floor(Number(project.totalprojectvalue) - Number(projectUpdateModel.achievedrevenuevalue)),

      },
      where: { projectid: projectid }
    });
    console.log(res.paymentid);
    console.log("----------paymentMilestoneRepository-------9");
    // ADD ADVANCE TO NEXT MILESTONE
    console.log("----------ADD ADVANCE TO NEXT MILESTONE----------10");
    if (advanceForNextMilestone > 0) {
      const nextMilestoneIndex = milestone.sequence + 1;
      console.log(340340, nextMilestoneIndex);
      let nextMilestoneID;
      if (project.paymentmilestonelist) {
        console.log("if");
        project.paymentmilestonelist.filter(
          (o) => o.sequence === nextMilestoneIndex
        );
      } else {
        console.log("else");
        const getPaymentMileStoneList = await prisma.dc_paymentmilestone.findFirst({ where: { projectid: project.id } });
        if (getPaymentMileStoneList && getPaymentMileStoneList.length > 0) {
          getPaymentMileStoneList.filter(
            (o) => o.sequence === nextMilestoneIndex
          )
        } else {
          throw new HttpError(400, 'No Payment Milestones found for this project')
        }
        console.log(345345, nextMilestoneID)
        if (nextMilestoneID) {
          const nextMilestone = await prisma.dc_paymentmilestone.findFirst({ where: { id: nextMilestoneID[0].id } });
          const updatedNextMilestone = new MilestoneUpdateRequestModel();
          await prisma.dc_paymentmilestone.update({
            data: { advanceamount: Math.floor(Number(nextMilestone.advanceamount) + Number(advanceForNextMilestone)) },
            where: { id: nextMilestoneID[0].id }
          });
          const amountDue = Math.floor(nextMilestone.totalpayableamount -
            nextMilestone.amountpaid - parseInt(updatedNextMilestone.advanceamount, 10)
          );
          await prisma.dc_paymentmilestone.update({
            data: { amountdue: amountDue },
            where: { id: nextMilestoneID[0].id }
          });
          if (amountDue > 0) {
            await prisma.dc_paymentmilestone.update({
              data: {
                status: PaymentStatusEnum.PARTIAL_PAYMENT,
                isfreezed: false,
                freezedmodular: 0
              },
              where: { id: nextMilestoneID[0].id }
            });
          } else {
            await prisma.dc_paymentmilestone.update({
              data: {
                status: PaymentStatusEnum.PAID,
                isfreezed: true,
                freezedmodular: nextMilestone.amountpaid
              },
              where: { id: nextMilestoneID[0].id }
            });
          }
        }
      }
    }
    await callAddPaymentReceiveNotification(project, receivedamount, receiveddate)
    addPaymentconformationResponseObj = { message: "success", data: res, code: 200 }
    return addPaymentconformationResponseObj;
  }
}

const captureManualPaymentOnMicroservice = async (updatepaymentlinkargs) => {
  const { project, milestone, customer,
    receivedamount, receiveddate, transcationid, modeofpayment, attachmentURL } = updatepaymentlinkargs
  try {
    const manualPaymentData = new CaptureManualPaymentModel();
    console.log(project.projectid);
    manualPaymentData.projectId = project.projectid;
    manualPaymentData.projectName = project.projectname;
    manualPaymentData.invoiceNumber = milestone.invoicenumber;
    manualPaymentData.paymentId =
      milestone.paymentValue = "5%" ? `${milestone.paymentvalue} supply of interior works` : `${milestone.paymentvalue} supply of works`;
    manualPaymentData.amountPaid = Number(receivedamount);
    manualPaymentData.paymentReceivedDate = receiveddate; //sending to Microservice in Local Date Format
    manualPaymentData.transactionId = transcationid;
    switch (modeofpayment) {
      case PaymentModeEnum.CASH:
        manualPaymentData.paymentMode = "CASH";
        break;
      case PaymentModeEnum.CHEQUE:
        manualPaymentData.paymentMode = "CHEQUE";
        break;
      case PaymentModeEnum.IMPS:
        manualPaymentData.paymentMode = "IMPS";
        break;
      case PaymentModeEnum.NEFT:
        manualPaymentData.paymentMode = "NEFT";
        break;
      case PaymentModeEnum.ONLINE:
        manualPaymentData.paymentMode = "ONLINE";
        break;
    }
    manualPaymentData.customerPhone = customer.customerphone;
    manualPaymentData.projectName = project.projectname;
    manualPaymentData.milestoneId = milestone.id;
    manualPaymentData.isFromDD = true
    if (attachmentURL) {
      manualPaymentData.paymentReceipt = attachmentURL;
    }
    console.log("Customer:=----- ", customer);
    console.log(
      "captureManualPaymentOnMicroservice Payment Request Data: ",
      manualPaymentData
    );
    const url = process.env.apiEndpoint + `captureManualPayment`;
    const paymentCapture = await superagent
      .post(url)
      .send(manualPaymentData)
      .set("Content-Type", "application/json");
    console.log(
      "============================================paymentCapture: ",
      JSON.stringify(paymentCapture.body)
    );
    if (paymentCapture.body.statusCode !== 200) {
      console.log(611)
      throw new HttpError(201, paymentCapture.body.message);
    }
    let updatedPaymentLink;
    if (
      paymentCapture.body &&
      paymentCapture.body.data &&
      paymentCapture.body.data.updatedPaymentLink
    ) {
      updatedPaymentLink = paymentCapture.body.data.updatedPaymentLink;
      console.log("updatedPaymentlInk", updatedPaymentLink);
    }
    return updatedPaymentLink;
  } catch (error) {
    console.log(596, error)
    throw error;
  }

}
const callAddPaymentReceiveNotification = async (project, receivedamount, receiveddate) => {
  const notificationTemplate = await callExternalAPIWithPost(
    "https://cmsandbox.herokuapp.com/graphqlm",
    queryForFetchingRemindersTemplate("notify_payment_received")
  );
  if (notificationTemplate) {
    const data = notificationTemplate?.data?.reminders.data[0].attributes;
    let toList;
    const ccList = [];
    if (data.emailActivate) {
      if (project) {

        if (project.designerid) {
          const designer = await prisma.dc_users.findUnique({ where: { userid: project.designerid } });
          if (designer && designer.designcafeemail) {
            ccList.push(designer.designcafeemail)
          }

        }
        else {
          ccList.push("lorenzo@designcafe.com")
        }
        ccList.push("ddadmin@designcafe.com")

        if (project.chmid) {
          const pam = await prisma.dc_users.findUnique({ where: { userid: project.chmid } });
          if (pam && pam.designcafeemail) {
            ccList.push(pam.designcafeemail)
          }
        }
        if (project.experiencecenterid) {
          const experienceCenter = await prisma.dc_experiencecenters.findUnique({ where: { centerid: project.experiencecenterid } })
          if (experienceCenter) {
            const financeEmailID = experienceCenter.financeteamemail;
            toList = financeEmailID;
          }
        } else {
          toList.push("ddadmin@designcafe.com")
        }
      }
      const subject = data.label

      const content = data.email_template
      const emailContent = content
        .replace("$project name", project.projectname)
        .replace("$received amount", receivedamount)
        .replace("$clientid", project.projectid)
        .replace("$paymentdate", receiveddate)

      await triggerEmailNotification(toList, subject, emailContent, ccList)
    }

  }

}
