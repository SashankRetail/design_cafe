import { prisma } from "../../../../prismaConfig";
import PaymentCategoryEnum from  "../../../../domain/enumerations/PaymentCategoryEnum";
import HttpError from "standard-http-error";


export const CalculatePaymentRequest = async (root, args, context) => {
    const { category,clientid,description,baseamount} = args;
       const PaymentRequest = await prisma.dc_paymentrequests.findFirst({
       where: {
        category:category,
        clientid:clientid,
       description:description,
      },
      });
      if(PaymentRequest){
        return {
          code: 200,
          message: "Already available",
          data:PaymentRequest
        }
      }else{
          const project = await prisma.dc_projects.findFirst({
                where:{
                    clientid:clientid
                }} );

            if(project == null){
                return{
                    code: 200,
                    message: "No project found",
                 }
            }
            const PRAmount = await calculatePRAmount(category,description,baseamount);
            return{
                code: 200,
                message: "Success",
                data:PRAmount
            }
        }
}
const calculatePRAmount = async(category,description,baseamount) =>{
    let totalAmount:number;
            if(category.toLowerCase() === PaymentCategoryEnum.MODULAR){
                console.log("Modular");
                totalAmount = baseamount;
                let milestoneAmountValue:number;
                if(description === "15% of Modular"){
                milestoneAmountValue = (totalAmount * 20)/100;
                }else if(description === "35% of Modular"){
                milestoneAmountValue = (totalAmount * 55)/100;
                }else if(description === "45% of Modular"){
                milestoneAmountValue = totalAmount;
                }else{
                throw new HttpError(201, "Modular Milestone Mismatch");
                }
                return milestoneAmountValue;
            }else if(category.toLowerCase() === PaymentCategoryEnum.SITE_SERVICE){
                totalAmount = baseamount;
                let milestoneAmountValue:number;
                if(description === "45% of Site Service"){
                milestoneAmountValue = (totalAmount * 50)/100;
                }else if(description === "50% of Site Service"){
                milestoneAmountValue = totalAmount;
                }else{
                throw new HttpError(201, "Site Services Milestone Mismatch");
                }
                return milestoneAmountValue;
            }else{
               return{
                code: 201,
                message: "Payment category Mismatch",
               }
            }
}
