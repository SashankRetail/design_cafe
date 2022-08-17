export const authenticationTokenReslover = {
    Mutation:{
        AuthenticationToken:async(_, {clientId},{ dataSources })=>
        dataSources.AuthenticationToken.authenticationTokenData(clientId)
    },

}
