import { prisma } from "../../../prismaConfig";

export const updateCustomer = async(_root, args, _context) =>{
    const customerUpdateResponse = {code:200,message:null,data:null}
    try{
        const {firstname,lastname,customeremail,customerphone,salesforceid,pancardno,gstno,odoocontactid} = args.customer;
        const customerData = await prisma.dc_customer.findFirst({
            where:{
                customerphone:customerphone
            }
        })

        if(customerData){
            const updateCustomerData = await prisma.dc_customer.update({
                where:{
                      customerphone:customerphone
                },
                data:{
                    firstname,
                    lastname,
                    customeremail,
                    customerphone,
                    salesforceid,
                    pancardno,
                    gstno,
                    odoocontactid,
                }
            })
            customerUpdateResponse.code = 200;
            customerUpdateResponse.message = 'Customer Data Updated';
            customerUpdateResponse.data = updateCustomerData;
        }
        else{
            customerUpdateResponse.code = 400;
            customerUpdateResponse.message = 'Customer Does Not Exist In the Database';
        }
    }
    catch(e){
        customerUpdateResponse.code = 400;
        customerUpdateResponse.message = e.message;
    }
    return customerUpdateResponse;
}
