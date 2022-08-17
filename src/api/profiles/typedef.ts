export const profilesTypedef =`
scalar JSON
type Profiles {
    profileid: Int
    profile_name: String
    status: Boolean
    permissions:JSON
    created_date: DateTime
    updated_at: DateTime
}

type profileResponse {
    code:Int
    message: String
    data:Profiles
}

type getprofileResponse{
    code:Int
    message: String
    data:[Profiles]
}

type Query {
    getAllProfiles:getprofileResponse
    getProfileById(profileid:Int):getprofileResponse
}
type Mutation{
    addProfile(
        profile_name:String,
        status:Boolean,
        permissions:JSON,
        created_date:DateTime,
        updated_at:DateTime): profileResponse

        updateProfile(
            profileid:Int!
            profile_name:String,
            status:Boolean,
            permissions:JSON,
            created_date:DateTime,
            updated_at:DateTime): profileResponse

}
scalar DateTime

`;
