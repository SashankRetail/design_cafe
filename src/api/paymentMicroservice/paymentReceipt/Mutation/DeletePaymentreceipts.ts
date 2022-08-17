import { RESTDataSource,RequestOptions } from 'apollo-datasource-rest';

class DeletePaymentReceipts extends RESTDataSource {
  constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;

      }
      willSendRequest(request: RequestOptions) {
        request.headers.set('Authorization',this.context.headers.authorization);
      }
      // delete
      async deletepaymentReceiptData(args) {
        const {paymentId} = args;
      return this.delete('deletePaymentReceipt',{
        // request
        paymentId,
     },
      )
      }
}
export default DeletePaymentReceipts
