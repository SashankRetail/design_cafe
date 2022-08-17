import { RESTDataSource,RequestOptions } from 'apollo-datasource-rest';

class DeletePaymentRequests extends RESTDataSource {
  constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;

      }
      willSendRequest(request: RequestOptions) {
        request.headers.set('Authorization',this.context.headers.authorization);
      }
      // post
      async deletepaymentRequestData(requestID) {
      return this.delete('deletePaymentRequest',{
        // request
         requestID,
    }, {
        body :requestID
    },
      )
      }
}
export default DeletePaymentRequests
