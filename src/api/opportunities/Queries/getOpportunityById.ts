import { prisma } from "../../../prismaConfig";
import { defaultResponseObj } from "../../../utils/commonUtils";
import { mapAllUsers } from "../../users/Queries/GetAllUsers";

export const getOpportunityDetailsById = async(_root, args, _context) =>{
    const {opportunityId} = args

    try{
        const fetchedOpportunityDetails = await prisma.opportunity.findFirst({
            where:{
                sfid:opportunityId
            },
            include:{
                designerUser:{
                    include: {
                        users_city: {
                            include: { city: true },
                      },
                      users_team: {
                        include: { team: true },
                      },
                      users_experiencecenters:{
                        include:{ center:true }
                      }
                    }
                }
            }
        })
        console.log(29,fetchedOpportunityDetails);
        if(fetchedOpportunityDetails){
            const designUser = mapAllUsers(fetchedOpportunityDetails?.designerUser ? [fetchedOpportunityDetails?.designerUser] : []);
            if(designUser){
                fetchedOpportunityDetails.designerUser = designUser[0];
            }

            defaultResponseObj.code = 200;
            defaultResponseObj.data = fetchedOpportunityDetails;
        }
        else{
            defaultResponseObj.code = 400;
            defaultResponseObj.message = "No Opportunity found with the given id";
        }
    }
    catch(e){
        console.log(e);
        defaultResponseObj.code = 400
        defaultResponseObj.message = e.message;
    }
    return defaultResponseObj;
}

