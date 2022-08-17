import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import {
   AddPaymentReceiptRequestData, PaymentStatusEnum,
} from "../../../../domain/Requestdata/Paymentmilestoneupdaterequestmodel";
import { UploadFileOnS3 } from "../../../../domain/services/baseUseCase/baseUseCase";

export const UpdatePaymentConformation = async (root, args, context) => {
   let updatePcResponseObj;

   const { milestoneid, projectid, receivedamount, modeofpayment, receiveddate, attachment, paymentid } = args;
   const paymentConfirmation = await prisma.dc_paymentreceipts.findFirst({
      where: { paymentid: paymentid }
   });
   console.log(paymentConfirmation);
   if (!paymentConfirmation) {
      throw new HttpError(201, "Invalid Payment Detail ID");
   }
   const project = await prisma.dc_projects.findFirst({
      where: { projectid: projectid }
   });
   const milestone = await prisma.dc_paymentmilestone.findFirst({
      where: { id: milestoneid }
   });
   const paymentConfirmationData = new AddPaymentReceiptRequestData();
   if (attachment) {

      const attachmentFile = {
         key: attachment.fileName,
         contentType: attachment.contentType,
         base64: attachment.fileBase64,
      };
      const fileObj = await UploadFileOnS3(attachmentFile);
      if (!fileObj) {
         throw new HttpError(201, "Error uploading attachment");
      }
      paymentConfirmationData.supportingDocumentURL = fileObj.Location;
      paymentConfirmationData.awsSupportingDocumentURLKey = fileObj.key;
   }
   const amountDifference = Number(receivedamount) - Number(paymentConfirmation.receivedamount);
   console.log(amountDifference);
   let advanceForNextMilestone = 0;
   if (amountDifference !== 0) {
      const updatedAmountPaidValue = Number(milestone.amountpaid) + Number(amountDifference);
      if (updatedAmountPaidValue > Number(milestone.totalpayableamount)) {
         advanceForNextMilestone = updatedAmountPaidValue - Number(milestone.totalpayableamount);
      }
      const updatedAmountDue = Number(milestone.totalpayableamount) - updatedAmountPaidValue - Number(milestone.advanceamount);
      await prisma.dc_paymentmilestone.update({
         data: {
            amountpaid: Math.floor(updatedAmountPaidValue),
            amountdue: Math.floor(updatedAmountDue)
         },
         where: { id: milestoneid }
      });
      if (updatedAmountDue <= 0) {
         await prisma.dc_paymentmilestone.update({
            data: {
               freezedmodular: updatedAmountPaidValue,
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
      const achievedrevenuevalue = Math.floor(Number(project.achievedrevenuevalue) + Number(amountDifference));
      console.log(paymentConfirmation.id);
      const res = await prisma.dc_paymentreceipts.update({
         data: {
            receivedamount: receivedamount,
            amountpaid: receivedamount,
            paymentmode: modeofpayment,
            paymentreceiveddate: receiveddate
         },
         where: { id: paymentConfirmation.id }
      });
      if (!res) {
         throw new HttpError(201, "Error adding Payment");
      }
      await prisma.dc_projects.update({
         data: {
            achievedrevenuevalue: Math.floor(Number(project.achievedrevenuevalue) + Number(amountDifference)),
            pendingamountvalue: Math.floor(Number(project.totalprojectvalue) -
               Number(achievedrevenuevalue))
         },
         where: { projectid: projectid }
      });
      if (advanceForNextMilestone > 0) {
         const nextMilestoneIndex = milestone.sequence + 1;
         const nextMilestoneID = project.paymentmilestonelist.filter(
            (o) => o.sequence === nextMilestoneIndex
         );
         if (nextMilestoneID) {
            const nextMilestone = await prisma.dc_paymentmilestone.findFirst({
               where: { id: nextMilestoneID }
            });
            await prisma.dc_paymentmilestone.update({
               data: {
                  advanceamount: Math.floor(advanceForNextMilestone),
                  amountdue: Math.floor(
                     Number(nextMilestone.totalpayableamount) - Number(nextMilestone.amountpaid) -
                     Number(advanceForNextMilestone)),
               },
               where: {
                  id: nextMilestoneID
               }
            });
         }
      }
      console.log(res);
      updatePcResponseObj = {
         data: res,
         message: "success",
      }

   }

   return updatePcResponseObj;
}
