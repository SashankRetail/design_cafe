export const authenticationTokenTypedef =`
scalar JSON
type authenticationdata{
    statusCode:Int
    code:Int
    message:String
    accessToken:String
}
type Mutation {
    AuthenticationToken(clientId:String):authenticationdata
}
`;
