export const departmentTypedef = `
    type Department{
        departmentid:Int
        name:String
        status:Boolean
        create_at:DateTime
        updated_at:DateTime
    }

    type getDepartmentResponse{
        code:Int
        message:String
        data:[Department]
    }

    type Query {
        getAllDepartments: getDepartmentResponse
    }

    scalar DateTime
`;
