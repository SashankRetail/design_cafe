export const InvoiceTypedef = `
scalar JSON
input invoiceRequestData{
    milestone:String
    currentProjectValue:Float
    clientID: String
    category:String
    currentModularValue:Float
    currentSiteServicesValue:Float
    baseAmount:Float
    additionalCharge:Float
    status:String
}


type generateInvoiceoldflowResponse{
    message:String
    data:JSON
    code:Int
}

type generateNewInvoiceResponse{
    code:Int
    message: String
    data:JSON
}
type getInvoice{
    code:Int
    message: String
    data:JSON
}

type calculateInvoiceNewFlowData{
    code:Int
    message: String
    data:JSON
}
type updateInvoiceoldflow{
    data:JSON
    message: String
    code:Int
}

type Mutation{

    generateInvoiceOldFlow(
        projectid: Int
        milestoneid: Int
        isRegenerate:Boolean
    ):generateInvoiceoldflowResponse

    GenerateInvoicenewflow(invoiceData:invoiceRequestData):generateNewInvoiceResponse
    CalculateInvoicenewflow(
        category:String
        clientid:String
        milestoneName:String
    ):calculateInvoiceNewFlowData
    UpdateInvoiceOldFlow(
        projectid:String,
        milestoneid:Int,
        invoicedate:String,
        invoiceamount:Float
    ):updateInvoiceoldflow
}

type Query {
    getInvoiceNewFlow(id:String):getInvoice
}
scalar DateTime
`
