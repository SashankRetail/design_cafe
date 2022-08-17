export const requirementFormTypedef = `
    type Query {
        getRequirementForm: requirementFormResponse
    }
    type requirementFormResponse { 
        code:Int
        message: String
        data: JSON
    }

    type Mutation {
            editRequirementForm(
            requirementformdetails: JSON!,
            updated_at: DateTime): requirementFormResponse
    }

    scalar DateTime
`
