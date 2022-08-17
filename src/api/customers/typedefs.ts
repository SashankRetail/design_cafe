export const customerTypedefs = `

type Address{
    addressid:Int
    city:String
    country:String
    street:String
    zip:String
    state:String
    addresstype:Int
    customerid:Int
}

type Customer {
  customerid: Int
  otp: Int
  generatedotptimestamp: String
  firstname: String
  lastname: String
  customeremail: String
  customerphone: String
  customertype:String
  salesforceid: String
  pancardno: String
  gstno: String
  odoocontactid: String
  addresses:[Address]
}

type responseCustomer{
    Customer: Customer
    projectid: Int
    clientid: String
    projectstatus: String
    smartsheetid: String
    quoteid: Int
    isnewpaymentproject: Boolean
}

type getCustomerDetailsByAuthResponse{
    code: Int
    message: String
    data: responseCustomer
}

input AddressToBeAdded{
    city:String
    country:String
    street:String
    zip:String
    state:String
    addresstype:Int
}

input CustomerToBeAdded{
    firstname: String
    lastname: String
    customeremail: String
    customerphone: String
    salesforceid: String
    pancardno: String
    gstno: String
    odoocontactid: String
    addresses:[AddressToBeAdded]
}

input CustomerToBeEdited{
    firstname: String
    lastname: String
    customeremail: String
    customerphone: String
    salesforceid: String
    pancardno: String
    gstno: String
    odoocontactid: String
}

type customerReponse{
    code:Int
    message:String
    data:Customer
}

type LoginResponse {
    code:Int!
    message:String!
}

type VerifyOTPResponse {
    code:Int!
    message:String!
    data: tokenResponseCD
}

type tokenResponseCD { 
    loginToken: String,
    refreshToken: String,
    email: String,
    customerName: String
}

type reIssueTokenResponse{
    code:Int!
    message:String!
    data: tokenResponseCD
}

type raiseTicketResponse { 
    code:Int
    message: String    
}

type viewAllTicketsResponse {
    code:Int
    data: [JSON]
    totalTickets: Int
    openTickets: Int
    closedTickets: Int
}

type Mutation{
    login(customerphone:String): LoginResponse,
    verifyOtp(customerphone:String,otp:String):VerifyOTPResponse
    reIssueAccessTokenCD(refreshToken: String!):reIssueTokenResponse
    addCustomers(customer:CustomerToBeAdded):customerReponse
    updateCustomers(customer:CustomerToBeAdded):customerReponse
    updateCustomerSFID(sfid:String,customerMobile:String):customerReponse
    updateCustomerData(sfid:String,customer:CustomerToBeEdited):customerReponse
    updateCustomerDetails(customerPhone:String,
                          customertype:String,
                          customeremail:String, 
                          fisrtname:String, 
                          lastname:String,
                          salesforeceid:String, 
                          odoocontactid:String,
                          address:[AddressToBeAdded],
                          gstno:String,
                          pancardno:String,
                          i10ingsttreatment:String,
                          dsacategory:String,
                          region:String):customerReponse
    updateCustomerOpportunityId(opportunityID:String,customerPhone:String):customerReponse
    raiseTicket(concerntype: String!
        subject: String!,
        description: String!,
        attachment: JSON,
        ticketbucket: Int
        ):raiseTicketResponse

    raiseComment(ticketId: Int!
        message: String,
        attachment: JSON,
        ):raiseTicketResponse
    
      
}

type Query {
    viewAllRaisedTickets(status: Int, casenumber: String, fromDate: String, toDate:String ): viewAllTicketsResponse
}

type Query{
    getCustomerDetailsByAuth:
    getCustomerDetailsByAuthResponse
}

scalar JSON
scalar DateTime
`;
