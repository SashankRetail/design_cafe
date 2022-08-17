import { prisma } from "../../../prismaConfig";

export const updateCustomerDetails = async (_root, args, _context) => {
  const customerUpdateResponse = { code: 200, message: null, data: null };
  try {
    const {
      firstname,
      lastname,
      salesforceid,
      odoocontactid,
      customerPhone,
      gstno,
      pancardno,
      customertype,
      i10ingsttreatment,
      dsacategory,
      region,
      customeremail,
    } = args;
    const addresses = args.address;
    const customerData = await prisma.dc_customer.findFirst({
      where: {
        customerphone: customerPhone,
      },
    });

    if (customerData) {
      const updateCustomerData = await prisma.dc_customer.update({
        where: {
          customerphone: customerPhone,
        },
        data: {
          firstname: firstname,
          lastname,
          salesforceid,
          odoocontactid,
          gstno,
          pancardno,
          customertype,
          i10ingsttreatment,
          dsacategory,
          region,
          customeremail,
        },
      });
      customerUpdateResponse.code = 200;
      customerUpdateResponse.message = "Customer Data Updated";
      customerUpdateResponse.data = updateCustomerData;
    }
    if (customerData) {
      for (let address = 0; address < addresses.length; address++) {
        try {
          const fetchAddressDataIfExist = await prisma.dc_addresses.findFirst({
            where: {
              customerid: customerData.customerid,
              addresstype: addresses[address].addresstype,
            },
          });

          if (fetchAddressDataIfExist) {
            await prisma.dc_addresses.updateMany({
              where: {
                customerid: customerData.customerid,
                addresstype: addresses[address].addresstype,
              },
              data: {
                city: addresses[address].city,
                country: addresses[address].country,
                zip: addresses[address].zip,
                street: addresses[address].street,
                state: addresses[address].state,
                addresstype: addresses[address].addresstype,
              },
            });
          } else {
            await prisma.dc_addresses.create({
              data: {
                customerid: customerData.customerid,
                city: addresses[address].city,
                country: addresses[address].country,
                zip: addresses[address].zip,
                street: addresses[address].street,
                state: addresses[address].state,
                addresstype: addresses[address].addresstype,
              },
            });
          }
          customerUpdateResponse.code = 200;
          customerUpdateResponse.message = "Customer's details are Updated";
          customerUpdateResponse.data = customerData;
        } catch (e) {
          console.log(e);
          customerUpdateResponse.code = 400;
          customerUpdateResponse.message = e.message;
          return customerUpdateResponse;
        }
      }
    } else {
      customerUpdateResponse.code = 400;
      customerUpdateResponse.message =
        "Phone number does not exist in the database";
    }
  } catch (e) {
    customerUpdateResponse.code = 400;
    customerUpdateResponse.message = e.message;
  }
  return customerUpdateResponse;
};
