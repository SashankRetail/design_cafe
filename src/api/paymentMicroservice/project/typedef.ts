export const ProjectaymentTypedef = `
scalar JSON

type projectupdatedata{
    statusCode:Int
    message:String
}

type getpmlistResponse{
    code:Int
    message: String
    data:JSON
}
type getpmdetailresponse{
    code:Int
    message: String
    payentConfirmationsList:JSON
    pmdetail:JSON
}

type Mutation {

updateProject(
    clientid:String,
    shippingAddressCountry:String,
    shippingAddressShippingState:String,
    shippingAddressStreet1:String,
    shippingAddressStreet2:String,
    shippingAddressCity:String,
    shippingAddressZipOrPostalCode:String
):projectupdatedata
}

type Query {
    getPaymentMilestoneList(projectid:Int):getpmlistResponse
    getPaymentMilestoneDetail(id:Int):getpmdetailresponse
}

`;
