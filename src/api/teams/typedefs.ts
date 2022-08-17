export const teamsTypedef = `
    type Teams{
        name:String
        teammailid:String
        reportingmanager:String
        teamlead:String
        department:String
        odoo_id:String
        create_at:DateTime
        updated_at:DateTime
        id:Int
        teamsdepartment:Int
        departments:Department
        cities: [Cities]
        experiencecenters: [ExperienceCenters],
        reportingmanageruser:Users
    }
 
    type getAllTeams{
        Teams: [Teams!]!
    }

    type TeamResponse { 
        code:Int
        message: String
        data:[Teams!]!
    }

    type GetTeamByIdResponse{
        code:Int
        message: String
        data:Teams
    }

    type Query{
        getTeamById(id:Int):GetTeamByIdResponse
        getAllTeams: getAllTeams
        getFilteredTeams(pageIndex: Int, pageSize: Int,department: String): getAllTeams
    }

    type Mutation{
        addTeam(name:String!,
            odoo_id:String,
            reportingmanager:Int!,
            teamlead:String,
            teammailid:String!,
            experiencecenters: [Int]!
            cities: [Int]!,
            teamsdepartment: Int!,
            create_at:DateTime,
            updated_at:DateTime): TeamResponse  
         
        updateTeam(
            id:Int!
            name:String,
            odoo_id:String,
            reportingmanager:Int,
            teamlead:String,
            teammailid:String,
            experiencecenters: [Int]
            cities: [Int],
            teamsdepartment: Int,
            updated_at:DateTime): TeamResponse
    }
    scalar DateTime
`;
