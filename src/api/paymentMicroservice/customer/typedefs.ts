export const customerPaymentTypedef =`
scalar JSON

type customerdata{
    statusCode:Int
    message:String
    code:Int
}
input AddressToBeUpdated{
    zipOrPostalCode:String
    street:String
    state:String
    country:String
    city:String
}

type addressResponse{
    message:String
    code:Int
    customerInfo:JSON
    billingAddress:JSON
    shippingAddress:JSON
}

input CustomerToBeUpdated{
    PAN: String
    l10n_in_gst_treatment: String
    GST: String
    customerPhone: String
    customerName: String
    customerEmail: String
    customerBillingAddress: [AddressToBeUpdated]
}


type Mutation {
UpdateCustomer(customer:CustomerToBeUpdated):customerdata
}

type Query {
    getCustomerAddress(customerid:Int):addressResponse
}
`;

