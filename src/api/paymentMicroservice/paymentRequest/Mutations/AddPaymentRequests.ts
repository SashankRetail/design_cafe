import { RESTDataSource,RequestOptions } from 'apollo-datasource-rest';

class AddPaymentRequests extends RESTDataSource {
  constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;

      }
      willSendRequest(request: RequestOptions) {
        request.headers.set('Authorization',this.context.headers.authorization);
      }
      // post
      async addpaymentRequestData(args) {
        const {requestDate,category,requestAmount,description,clientID,status,appName} = args;

       return this.post('createPaymentRequest',{
        // request
        requestDate,
        category,
        requestAmount,
        description,
        clientID,
        status,
        appName,
     },
      )
      }
}
export default AddPaymentRequests
