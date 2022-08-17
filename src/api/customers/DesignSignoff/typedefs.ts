export const designSignoffTypedef = `

    type Query {
        getDesignSignoffDocs(filterValue:Int): designSignoffResponse
    }

    type designSignoffResponse{
        code: Int
        message: String,
        data:[JSON]
    }
    type acceptDesignSignOffDocsResponse{
        code: Int
        message: String
    }
    type Mutation{
        acceptDesignSignOffDocs(
            documentname: String!,
            status: Int!
        ):acceptDesignSignOffDocsResponse
    }

    scalar DateTime
`;
