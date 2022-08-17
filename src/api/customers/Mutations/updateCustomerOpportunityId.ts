import { prisma } from "../../../prismaConfig";

export const updateCustomerOpportunityId = async(_root, args, _context)=>{
    const customerUpdateResponse = {code:200,message:null,data:null}
    try{
        const {opportunityID, customerPhone} = args;
        const customerData = await prisma.dc_customer.findFirst({
            where:{
                customerphone:customerPhone
            }
        })

        if(customerData){
            const updateCustomerData = await prisma.dc_customer.update({
                where:{
                      customerphone:customerPhone
                },
                data:{
                    opportunityid:opportunityID
                }
            })
            customerUpdateResponse.code = 200;
            customerUpdateResponse.message = 'Customer Data Updated';
            customerUpdateResponse.data = updateCustomerData;
        }

        else{
            customerUpdateResponse.code = 400;
            customerUpdateResponse.message = 'Phone number does not exist in the database';
        }

    }
    catch(e){
        customerUpdateResponse.code = 400;
        customerUpdateResponse.message = e.message;
    }
    return customerUpdateResponse;
}
