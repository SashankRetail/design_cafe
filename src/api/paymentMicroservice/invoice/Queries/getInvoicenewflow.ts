import { prisma } from "../../../../prismaConfig";

export const getInvoiceNewFlow= async (root, args, context) => {
    let invoiceResponseObj;
    try{
        const pr = await prisma.dc_odooinvoice.findMany({where: { clientid: args.id }});
        invoiceResponseObj = { code: 200, message: "success",data:pr}
        return invoiceResponseObj
    }catch (error) {
        invoiceResponseObj = { code: 400, message: error.message }
        return invoiceResponseObj
      }
}
