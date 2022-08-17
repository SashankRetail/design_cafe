import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";

class AddPaymentReceipts extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.apiEndpoint;
  }
  willSendRequest(request: RequestOptions) {
    request.headers.set("Authorization", this.context.headers.authorization);
  }
  // post
  async addpaymentReceiptData(args) {
    const {
      transactionId,
      receivedAmount,
      projectID,
      paymentRequests,
      paymentReceivedDate,
      paymentMode,
      siteServicesAmount,
      clientID,
      modularAmount,
    } = args;

    return this.post("createPaymentReceipt", {
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
    });
  }
}
export default AddPaymentReceipts;
