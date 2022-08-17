export const usersTypedef = `

    type AllManageUsersData{
        Cities: [Cities!]!,
        Departments: [Department!]!
        Teams: [Teams!]!
        Profiles: [Profiles!]!
        ExperienceCenters: [ExperienceCenters!]!    
    }

    type Users {
        userid : Int!
        roleid : Int
        profile: Profiles
        empid : String
        departmentid : Int
        salesforceimported : Boolean
        firstname : String
        lastname : String
        middlename : String
        username : String
        phonenumber : String
        designcafeemail : String
        reportingmanager : Int
        salesforceuserid : String
        isbetauser : Boolean
        profilepic : String
        lastlogindate : DateTime
        logintoken: String
        refreshtoken: String
        created_at : DateTime
        updated_at : DateTime
        cities: [Cities]
        teams : [Teams]
        experiencecenters : [ExperienceCenters]
    }

    type addUserResponse {
        code: Int
        message: String
        data: [Users]
    } 

    type GetUserDetailsByIdResponse{
        code: Int,
        message: String,
        data: Users
    }

    type GetAllUserResponse {
        code: Int,
        message: String,
        users: [Users]
    }

    type GetUserByIdResponse{
        code: Int,
        message: String,
        data: Users
    }

    type EditUserResponse {
        code: Int,
        message: String,
        users: [Users]
    }
    
    type GoogleAuthorizeResponse {
        code: Int,
        message: String
        url: String
    }

    type GoogleAuthorizeCallbackResponse {
        code: Int!
        message: String!
        data: tokenResponseDD!
    }

    type tokenResponseDD {
        loginToken: String!,
        refreshToken: String!,
        role: String,
        roleId: Int,
        userName: String!,
        email: String!
    }

    type reIssueAccessTokenResponse {
        code: Int!
        message: String!
        data: tokenResponseDD!
    }

    type GetAllDesignersResponse {
        code: Int,
        message: String,
        designers: [Users]
    }

    type Query {
        allManageUsersData: AllManageUsersData
        googleAuthorizeCallBack(code:String): GoogleAuthorizeCallbackResponse
        googleAuthorize: GoogleAuthorizeResponse
        getUserDetailsByAuth:GetUserDetailsByIdResponse
        reIssueAccessToken(refreshToken: String): reIssueAccessTokenResponse
        getAllUsers(userType:Int): GetAllUserResponse
        getAllDesigners: GetAllDesignersResponse
        getUserById(id:Int):GetUserByIdResponse 
    }

    type Mutation{
        updateUser(  
            id:Int,  
            empid:String,
            departmentid:Int,
            firstname:String,
            middlename:String
            lastname:String,
            username:String,
            phonenumber:String,
            designcafeemail:String,
            reportingmanager:Int,
            isbetauser:Boolean,
            profileid:Int,
            cities:[Int],
            experiencecenters:[Int],
            teams:[Int]
            ): EditUserResponse

            addUser (
                empid : String,
                firstname : String,
                lastname : String,
                middlename : String,      
                phonenumber : String,
                designcafeemail : String,
                reportingmanager : Int,
                experiencecenters: [Int],
                profileid:Int,
                team: [Int],
                city: [Int],
                created_at : DateTime,
                updated_at : DateTime
                ): addUserResponse
    }

    scalar DateTime
`;
