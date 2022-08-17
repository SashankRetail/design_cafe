export const RazorpayTypedef = `
scalar JSON

type generatelinkdata{
    statusCode:Int
    message:String
    code:Int
    response:JSON
}
type webhookdata{
    statusCode:Int
    message:String
    code:Int
}

type Mutation {
    RazorpayGeneratePaymentLink(
        amount:Float,
        description:String,
        reference_id:String,
        name:String,
        email:String,
        client_id:String,
        requestID:[String],
        appName:String
):generatelinkdata

RazorpayWebhook(
    razorpay_payment_link_id:String,
        razorpay_payment_link_reference_id:String,
        razorpay_payment_link_status:String,
        razorpay_signature:String,
        appName:String,
        razorpay_payment_id:String,
):webhookdata
}

`;
