import { prisma } from "../../../../prismaConfig";

export const getPaymentMilestoneList= async (root, args, context) => {
    let pmResponseObj
try{
    const pmlist = await prisma.dc_paymentmilestone.findMany({where: { projectid: args.projectid }});
    pmResponseObj = { code: 200, message: "success",data:pmlist}
    return pmResponseObj
}catch (error) {
    pmResponseObj = { code: 400, message: error.message }
    return pmResponseObj
  }
}
