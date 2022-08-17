import { RESTDataSource,RequestOptions } from 'apollo-datasource-rest';

class UpdatePaymentRequests extends RESTDataSource {
  constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;

      }
      willSendRequest(request: RequestOptions) {
        request.headers.set('Authorization',this.context.headers.authorization);
      }
      // post
      async updatepaymentRequestData(args) {
        const {requestID,requestDate,category,requestAmount,description,clientID,status,appName} = args;
      return this.put('updatePaymentRequest',{
        // request
        requestID,
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
export default UpdatePaymentRequests

