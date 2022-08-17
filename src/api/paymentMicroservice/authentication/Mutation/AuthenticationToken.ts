import { RESTDataSource} from 'apollo-datasource-rest';

class AuthenticationToken extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;
      }
      // post
      async authenticationTokenData(clientId) {
      return this.post('authenticate',{
        // request
        clientId
      })
      }
}
export default AuthenticationToken
