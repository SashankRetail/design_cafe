import { prisma } from "../../../../prismaConfig";

export const getPaymentRequest= async (root, args, context) => {
    let paymentRequestResponseObj;
    try{
        const pr = await prisma.dc_paymentrequests.findMany({where: { clientid: args.id }});
        paymentRequestResponseObj = { code: 200, message: "success",data:pr}
        return paymentRequestResponseObj
    }catch (error) {
        paymentRequestResponseObj = { code: 400, message: error.message }
        return paymentRequestResponseObj
      }
}
