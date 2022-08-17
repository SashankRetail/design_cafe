import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';

class UpdatePaymentReceipts extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.apiEndpoint;

  }
  willSendRequest(request: RequestOptions) {
    request.headers.set('Authorization', this.context.headers.authorization);
  }
  // put
  async updatepaymentReceiptData(args) {
    const { transactionId, receivedAmount, projectID, paymentRequests, paymentReceivedDate, paymentMode, siteServicesAmount, clientID,
      modularAmount, appName, paymentId, status, odoo_payment_id, paymentReceipt, reason_for_rejection } = args;
    return this.put('updatePaymentReceipt', {
      // request
      transactionId,
      receivedAmount,
      projectID,
      paymentRequests,
      paymentReceivedDate,
      paymentMode,
      siteServicesAmount,
      clientID,
      modularAmount,
      appName,
      paymentId,
      status,
      odoo_payment_id,
      paymentReceipt,
      reason_for_rejection
    },
    )
  }
}
export default UpdatePaymentReceipts
