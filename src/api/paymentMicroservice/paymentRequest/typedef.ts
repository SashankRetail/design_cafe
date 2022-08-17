export const paymentRequestTypedef = `
scalar JSON
type paymentrequestdata{
    statusCode:Int
    message:String
    data:JSON
    code:Int
}
type paymentrequestUpdatedata{
    statusCode:Int
    message:String
    code:Int
}


type getpaymentrequest{
    code:Int
    message: String
    data:JSON
}

type calculatepaymentrequest{
    code:Int
    message: String
    data:JSON
}

type Mutation {
    AddPaymentRequests(
        requestDate:String,
        category:String,
        requestAmount:Float,
        description:String,
        clientID:String,
        status:String,
        appName:String
    ):paymentrequestdata,

    UpdatePaymentRequests(
        requestID:String,
        requestDate:String,
        category:String,
        requestAmount:Float,
        description:String,
        clientID:String,
        status:String,
        appName:String
    ):paymentrequestUpdatedata,

    DeletePaymentRequests(
    requestID:String,
    ):paymentrequestUpdatedata,

    CalculatePaymentRequest(
        category:String
        clientid:String
       description:String
       baseamount:Float
       ):calculatepaymentrequest
    }

    type Query {
        getPaymentRequest(id:String):getpaymentrequest
    }
`;
