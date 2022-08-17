import { prisma } from "../../../prismaConfig";
import HttpError from "standard-http-error";
import { SupportPalBaseUsecase } from "../../../domain/services/baseUseCase/supportpalBaseUseCase";

export const addCustomer = async (_root, args, _context) => {
  const customerAddedResponse = { code: 200, message: null, data: null };
  try {
    const {
      firstname,
      lastname,
      customeremail,
      customerphone,
      salesforceid,
      pancardno,
      gstno,
      odoocontactid,
      addresses,
    } = args.customer;

    const lead = await prisma.lead.findFirst({
      where: { mobilephone: customerphone },
    });
    let leadid;
    if (lead) {
      leadid = lead.id;
    }

    const customerData = await prisma.dc_customer.findFirst({
      where: {
        customerphone: customerphone,
      },
    });

    if (!customerData) {
      const addedCustomer = await prisma.dc_customer.create({
        data: {
          firstname,
          lastname,
          customeremail,
          customerphone,
          salesforceid,
          pancardno,
          gstno,
          odoocontactid,
          leadid,
        },
      });
      if (addedCustomer) {
        addresses.forEach((address) => {
          address.customerid = addedCustomer.customerid;
        });

        for(const address of addresses){
          await prisma.dc_addresses.create({
            data: address,
          });
        }

        const fetchedRecentAddedCustomer = await prisma.dc_customer.findFirst({
          where: { customerid: addedCustomer.customerid },
        });

        customerAddedResponse.code = 200;
        customerAddedResponse.message = null;
        customerAddedResponse.data = fetchedRecentAddedCustomer;

        let response;
        await createCustomerInSupportPal(addedCustomer, 4, response);
      } else {
        customerAddedResponse.code = 400;
        customerAddedResponse.message = "Customer not added";
      }
    } else {
      customerAddedResponse.code = 400;
      customerAddedResponse.message = "Customer already Created in Database";
    }
  } catch (e) {
    console.log(55, e);
    customerAddedResponse.code = 400;
    customerAddedResponse.message = e.message;
  }
  return customerAddedResponse;
};
const createCustomerInSupportPal = async (customer, group, response) => {
  try {
    const operator = await SupportPalBaseUsecase().createUser({
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.customeremail,
      password: process.env.supportPalDCPassword, // hardcode pwd as requested by client
      group: group,
    });
    if (!operator.data.id) {
      throw new HttpError(400, "Unable to create operator in Salesforce!!");
    }
    console.log("operator.data.id ===========> ", operator.data.id);
    // dev comment
    await prisma.dc_customer.update({
      data: { supportpaloperatorid: operator.data.id },
      where: { customerid: customer.customerid },
    });
    return response;
  } catch (error) {
    return { code: 400, message: error.message };
  }
};
