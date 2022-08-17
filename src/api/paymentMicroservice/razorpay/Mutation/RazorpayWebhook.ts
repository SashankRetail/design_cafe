import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';

class RazorpayWebhook extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.apiEndpoint;

  }
  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', this.context.headers.authorization);
  }
  // post
  async webhookData(args) {
    const { razorpay_payment_link_id, razorpay_payment_link_reference_id, razorpay_payment_link_status, razorpay_signature, appName, razorpay_payment_id } = args;
    return this.post('webhook', {
      // request
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
      appName,
      razorpay_payment_id,

    },
    )
  }
}
export default RazorpayWebhook
