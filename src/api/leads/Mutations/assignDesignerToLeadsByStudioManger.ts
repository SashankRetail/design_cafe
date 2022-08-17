import { prisma } from "../../../prismaConfig"
import { getUser } from "../../users/Mutations/GetUser";
import { LeadsResponse } from "../LeadsResponseInterface";

export const assignDesigerToLeads = async(_root, args, _context) =>{
  let acceptRejectResponse : LeadsResponse = {code:200,message:null,data:null}
  try{
    const {userId,leadSfId,designerToBeAssigned} = args
    if(userId){
        /****Fetch the details of the user based on the ID *****/
        /****TO DO :-- Get User ID from Login Token*****/
        const fetchedUser = await getUser(userId);
        if(fetchedUser.length > 0){
            const leadFetchedBySfId =  await getLeadDetailsFromId(leadSfId);

            if(leadFetchedBySfId){
                acceptRejectResponse = await handleAcceptByStudioManagersOrAdmins(designerToBeAssigned,leadSfId)
            }
            else{
                acceptRejectResponse.code = 400
                acceptRejectResponse.message = "Lead Salesforce Id is not valid"
            }
        }
        else
        {
            acceptRejectResponse.code = 400
            acceptRejectResponse.message = "No User found with given id"
        }
    }
    else{
        acceptRejectResponse.code = 400
        acceptRejectResponse.message = "No User Id Provided"
    }
  }
  catch(e){
    acceptRejectResponse.code = 400;
    acceptRejectResponse.message = e.message;
  }

  return acceptRejectResponse;
}



const handleAcceptByStudioManagersOrAdmins = async(designerToBeAssigned,leadSfId) =>{
    const acceptRejectResponse : LeadsResponse = {code:200,message:null,data:null}

    if(designerToBeAssigned || designerToBeAssigned?.length > 0){
        acceptRejectResponse.data = await updateBroadCastedLeads({
            broadcast_status__c:3,
            design_user__c:designerToBeAssigned,
            has_designer_accepted__c:"Designer Assigned, Acceptance Pending"
        },leadSfId);
    }
    else{
        acceptRejectResponse.code = 400
        acceptRejectResponse.message = "Invalid Designer Id Provided"
    }

    return acceptRejectResponse;
}

const getLeadDetailsFromId = async(leadSfId) =>{
    if(leadSfId){
        return prisma.lead.findFirst({
            where:{
                sfid:leadSfId
            }
        })
    }
    return null
}

const updateBroadCastedLeads = async(dataToBeUpdated,leadSfId)=>{
    console.log(dataToBeUpdated,leadSfId);
     return prisma.lead.update({
        data:dataToBeUpdated,
        where:{sfid:leadSfId},
    })
}


