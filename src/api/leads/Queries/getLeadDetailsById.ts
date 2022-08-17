import { prisma } from "../../../prismaConfig"


export const getLeadDetailsById = async(parent,args,context)=>{
    const {leadid} = args;
    const getLeadByIdResponse = {code:200,message:null,data:null}

    const fetchedLeadById =  await prisma.lead.findFirst({
        where:{
            sfid:leadid
        }
    })
    getLeadByIdResponse.code = fetchedLeadById ? 200 : 400;
    getLeadByIdResponse.message = fetchedLeadById ? null:"No lead found for the given leadid";
    getLeadByIdResponse.data = fetchedLeadById ? fetchedLeadById : null;

    return getLeadByIdResponse;
}
