export const paymentReceiptTypedef = `
scalar JSON
type paymentreceiptdata{
    statusCode:Int
    message:String
    data:JSON
    code:Int
}

type paymentreceiptupdatedata{
    statusCode:Int
    message:String
    code:Int
}
type getpaymentreceipt{
    code:Int
    message: String
    data:JSON
}

type addpaymentconformation{
    data:JSON
    message: String
    code:Int
}

type deletepaymentconformation{
    code:Int,
    message:String
}

input AttachmentToBeUpdated{
    fileBase64:String,
    fileName:String,
    contentType:String

}

type Mutation {
    AddPaymentReceipts(
    transactionId:String,
    receivedAmount:Float,
    projectID:String,
    paymentRequests:[String],
    paymentReceivedDate:String,
    paymentMode:String,
    siteServicesAmount:Float,
    clientID:String,
    modularAmount:Float
):paymentreceiptdata

UpdatePaymentReceipts(
    transactionId:String,
        receivedAmount:Float,
        projectID:String,
        paymentRequests:[String],
        paymentReceivedDate:String,
        paymentMode:String,
        siteServicesAmount:Float,
        clientID:String,
        modularAmount:Float,
        appName:String,
        paymentId:String,
        status:String,
        odoo_payment_id:Int,
        paymentReceipt:String,
        reason_for_rejection:String
):paymentreceiptupdatedata

DeletePaymentReceipts(
    paymentId:String
):paymentreceiptupdatedata

AddPaymentConformation(
    transcationid:String,
    milestoneid:Int,
    projectid:String,
    receivedamount:Float,
    modeofpayment:Int,
    receiveddate:String,
    attachment:AttachmentToBeUpdated
):addpaymentconformation

UpdatePaymentConformation(
    milestoneid:Int,
    projectid:String,
    receivedamount:Float,
    modeofpayment:String,
    transactionid:String,
    receiveddate:String,
    paymentid:String,
    attachment:AttachmentToBeUpdated
):addpaymentconformation

ClearPaymentConformation(
    milestoneid:Int,
    projectid:String,
):deletepaymentconformation
}

type Query {
    getPaymentReceipt(id:String):getpaymentreceipt
}
`;
