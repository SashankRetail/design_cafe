import { prisma } from "../../../../prismaConfig";

export const getCustomerAddress = async (root, args, context) => {
    let CustomerAddressResponseObj;
    try {
        const customer = await prisma.dc_customer.findFirst({ where: { customerid: args.customerid } });
        const customerInfo = {
            customername: customer.firstname,
            customeremail: customer.customeremail,
            customerphone: customer.customerphone,
            pan: customer.pancardno,
            gst: customer.gstno
        }
        const address = await prisma.dc_addresses.findFirst({ where: { customerid: args.customerid, addresstype: 1 } });
        console.log("address", address);
        const billingAddress = {
            zip: address.zip,
            street: address.street,
            state: address.state,
            city: address.city,
            country: address.country
        }
        let shippingAddress = null;
        const CustomerSaddress = await prisma.dc_addresses.findFirst({ where: { addresstype: 2, customerid: args.customerid } });
        console.log(CustomerSaddress);
        if (CustomerSaddress) {
            shippingAddress = {
                zip: CustomerSaddress.zip,
                street: CustomerSaddress.street,
                state: CustomerSaddress.state,
                city: CustomerSaddress.city,
                country: CustomerSaddress.country
            }
        }
        CustomerAddressResponseObj = {
            code: 200, message: "success", customerInfo: customerInfo, billingAddress: billingAddress, shippingAddress: shippingAddress
        }
        return CustomerAddressResponseObj
    } catch (error) {
        CustomerAddressResponseObj = { code: 400, message: error.message }
        return CustomerAddressResponseObj
    }

}

