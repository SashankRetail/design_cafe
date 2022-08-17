export const changeRequestTypedefs = `
type change_request{
    id: Int
    projectid: Int
    request_type: String
    description: String
    stage: String
    created_at: DateTime
    updated_at: DateTime
}

type addChangeRequestResponse{
    code: Int
    message: String,
    data: change_request
}

type getChangeRequestResponse{
    code: Int
    message: String,
    data: [change_request]
}

type Mutation{
    addChangeRequest(
        quoteSfId: String,
        request_type: String!,
        description: String!,
        stage: String!,
    ):addChangeRequestResponse
}

type Query{
    getChangeRequest(quotesfid:String, stage: String!):getChangeRequestResponse
}`;
