import { prisma } from "../../../prismaConfig";
import { defaultResponseObj } from "../../../utils/commonUtils";

export const assignDesignerToOpportunity = async(_root, args, _context)=>{
    const {opportunitySFId,designerSFId} = args;

    try{
        await prisma.opportunity.update({
            data:{
                design_user__c:designerSFId
            },
            where:{
                sfid:opportunitySFId
            }
        })
        defaultResponseObj.code = 200;
        defaultResponseObj.message = "Designer Assigned Successfully to the Opportunity"
    }
    catch(e){
        defaultResponseObj.code = 400;
        defaultResponseObj.message = e.message
    }

    return defaultResponseObj;
}
