export const smartSheetTypedef = `

type CreateSheetResponse { 
    code:Int
    message: String
    sheetId : String
}
type Mutation{
    createSmartSheet(
        projectId : Int!,
        clientName : String!,
        clientId : String!,
        projectSignupValue : Float!,
        designerName : String!,
        designStudio : String!,
        salesOwner : String!,
        clientEmail : String,
        clientContact : String!,
        propertyName : String!,
        propertyAddress : String!,
        status : String!
    ): CreateSheetResponse

    updateDesignerEmail(
        smartSheetId : String!,
        designerEmail : String!
    ): SheetResponse

    updateSurvey(
        smartSheetId : String!,
        surveyExecutiveEmail : String!
    ): SheetResponse

    updateProjectValue(
        smartSheetId : String!,
        projectValue : Float!
    ): SheetResponse

    updateProjectAddress(
        smartSheetId : String!,
        projectAddress : String!
    ): SheetResponse
    
    updateMilestone(
        smartSheetId : String!,
        mileStoneName : String!,
        actualFinishDate : String!
    ): SheetResponse

    updateProjectStatus(
        smartSheetId : String!,
        projectStatus : String!,
        signupDate : String!
    ): SheetResponse

    webHookCallBack(
        body : JSON
    ): SheetResponse

    updatePaymentChecklist(
        smartSheetId : String!,
        mileStoneName : String!,
        actualFinishDate : String!
        actualStartDate : String!
    ): SheetResponse
}

type GetMileStoneResponse { 
    code:Int
    message: String
    data : JSON
}
type SheetResponse { 
    code:Int
    message: String
}

type Query {
    getMileStoneDetails(sheetId:String): GetMileStoneResponse
}
    scalar DateTime
    scalar JSON
`;
