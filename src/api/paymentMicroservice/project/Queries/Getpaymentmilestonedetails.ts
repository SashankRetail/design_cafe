import { prisma } from "../../../../prismaConfig";

export const getPaymentMilestoneDetail = async (root, args, context) => {
    let pmResponseObj
    try {
        const pmdetail = await prisma.dc_paymentmilestone.findFirst({ where: { id: args.id } });
        const payentConfirmationsList = await prisma.dc_paymentreceipts.findMany({
            where: {
                paymentmillestoneid: args.id
            }
        });
        pmResponseObj = { code: 200, message: "success", payentConfirmationsList: payentConfirmationsList, pmdetail: pmdetail }
        return pmResponseObj
    } catch (error) {
        pmResponseObj = { code: 400, message: error.message }
        return pmResponseObj
    }
}
