export const projectMomTypedef = `
type ProjectMoms{
    id : Int!
    projectid : Int
    milestoneid : Int
    designerid : Int
    meetingname : String
    meetingagenda : String
    meetingdescription : String
    meetingdate : DateTime
    status : String
    sentondate : DateTime
    attachments: [Attachments]
    momComments : [MomComments]
    }

    type MomResponse{
        code:Int
        message:String,
        data:[ProjectMoms]
        attachmentscount: Int
    }
    type Mutation{
        createMom(
            
            projectid : Int,
            milestoneid : Int,
            status : String): MomResponse
    
        updateMom(
            id : Int!,
            designerid : Int,
            meetingname : String,
            meetingagenda : String,
            meetingdescription : String,
            meetingdate : DateTime,
            attachment : JSON,
            status : String): MomResponse
    }

    type Query{
        getMomById(id:Int!): MomResponse
        getMomByProjectId(projectid:Int!,status:String): MomResponse
    }

    scalar DateTime
`;
