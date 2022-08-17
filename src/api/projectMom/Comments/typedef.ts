export const momCommentsTypedef = `

    type Attachments{
        id : Int!
        filekey : String
        contenttype : String
        location : String
        commentid : Int
        momid: Int
    }
    type MomComments{
        id : Int!
        momid : Int
        commentdetails : String
        addedby : String
        deletedby : String
        createdate : DateTime
        deleteddate : DateTime
        updatedate : DateTime
        isshow : Boolean
        attachments : [Attachments]
    }
    
    type MomCommentsResponse{
        code:Int
        message:String,
        data:[MomComments]
    }
    type Mutation{
        createMomComment(
            momid : Int!
            commentdetails : String
            addedby : String
            attachment : JSON): MomCommentsResponse 

        updateMomComment(
            id : Int
            commentdetails : String
            attachment : JSON): MomCommentsResponse
            
        deleteMomComment(
            id : Int
            deletedby : String): MomCommentsResponse
    }

    type Query{
        getCommentById(id:Int): MomCommentsResponse
    }

    scalar DateTime
`;
