import { prisma } from "../../../../prismaConfig";

export const getPaymentReceipt= async (root, args, context) => {
    let paymentReceiptResponseObj;
    try{
        const pr = await prisma.dc_paymentreceipts.findMany({where: { clientid: args.id }});
        paymentReceiptResponseObj = { code: 200, message: "success",data:pr}
        return paymentReceiptResponseObj
    }catch (error) {
        paymentReceiptResponseObj = { code: 400, message: error.message }
        return paymentReceiptResponseObj
      }
}
