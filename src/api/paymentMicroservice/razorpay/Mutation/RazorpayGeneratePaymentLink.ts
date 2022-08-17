import { RESTDataSource,RequestOptions } from 'apollo-datasource-rest';

class RazorpayGeneratePaymentLink extends RESTDataSource {
  constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;

      }
      willSendRequest(request: RequestOptions) {
        request.headers.set('Authorization',this.context.headers.authorization);
      }
      // post
      async paymentLinkData(args) {
        const {amount,description,reference_id,name,email,client_id,requestID,appName} = args;
      return this.post('razorpayGenearteLink',{
        // request
        amount,
        description,
        reference_id,
        name,
        email,
        client_id,
        requestID,
        appName
     },
      )
      }
}
export default RazorpayGeneratePaymentLink
