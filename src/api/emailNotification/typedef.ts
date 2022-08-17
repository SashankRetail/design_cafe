export const triggerEmailTypedef = `

type emailResponse { 
    code:Int
    message: String
}

type Mutation {
    triggerEmail(leadsfid:String,stagename:String,opportunitysfid:String):emailResponse
}

scalar DateTime
`;
