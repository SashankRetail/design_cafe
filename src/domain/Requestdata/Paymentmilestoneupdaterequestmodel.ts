class PaymentMilestoneUpdateRequestModel {
  invoicebaseamount: string;
  invoicenumber: string;
  invoicetotalamount: string;
  invoicetotaltaxamount: string;
  invoicetotalcgstaxamount: string;
  invoicetotalsgsttaxamount: string;
  invoicetotaligsttaxamount: string;
  invoicedate: Date;
  invoiceurl: string;
  paymentlink: string;
  paymentlinkid: string;
  rpayorderid: string;
  receiptid: string;
}
class AddPaymentReceiptRequestData {
  paymentname: string;
  receivedamount: string;
  paymentmode: number;
  transactionid: string;
  paymentreceiveddate: string;
  paymentmillestoneid: string;
  paymentMilestoneValue: string;
  projectid: string;
  paymentid: string;
  attachment: {
    fileBase64: string;
    fileName: string;
    contentType: string;
  };
  awsSupportingDocumentURLKey: string;
  supportingDocumentURL: string;
}
class CaptureManualPaymentModel {
  projectId: string;
  projectName: string;
  invoiceNumber: string;
  paymentId: string;
  amountPaid: number;
  paymentReceivedDate: string;
  transactionId: string;
  paymentMode: string;
  customerPhone: string;
  paymentReceipt: string;
  milestoneId: string;
  isFromDD: boolean;
}

class MilestoneUpdateRequestModel {
  amountpaid: string;
  amountdue: string;
  freezedmodular: number;
  totalpayableamount: string;
  isfreezed: boolean;
  status: PaymentStatusEnum;
  advanceamount: string;
  paymentlink: string;
}
class ProjectUpdateRequestModel {
  achievedrevenuevalue: string;
  pendingamountvalue: string;
}
enum PaymentStatusEnum {
  PAID = "Paid",
  PENDING = "Pending",
  PARTIAL_PAYMENT = "Paid Partially",
}

class ClearPaymentRequestModel {
  invoicenumber: string;
  status: PaymentStatusEnum;
  milestoneamount: string;
  totalpayableamount: string;
  advanceamount: string;
  amountpaid: number;
  addonamount: string;
  amountdue: string;
  freezedmodular: string;
  freezedsiteservice: string;
  paymentid: any;
  isfreezed: boolean;
  paymentvalue: string;
}

class MicroserviceManualInvoiceRequestModel {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerShippingAddress: Object;
  customerBillingaddress: AddressModel;
  projectID: string;
  projectName: string;
  projectStatus: string;
  requestName: string;
  paymentName: string;
  applicationId: string;
  invoiceDate: string;
  experienceCenter: string;
  projectValue: number;
  invoiceNumber: string;
  amount: number;
  milestonePendingDue: number;
  extraPayments: AddOnPaymentObject[];
  paymentStatus: string;
  amountPaid: number;
  amountDue: number;
}
class AddressModel {
  country: string;
  street: string;
  city: string;
  ziporpostalcode: string;
  shippingstate: string;
}
class AddOnPaymentObject {
  amount: number;
  paymentname: string;
  quantity: number;
}
export {
  AddPaymentReceiptRequestData,
  CaptureManualPaymentModel,
  MilestoneUpdateRequestModel,
  PaymentStatusEnum,
  ProjectUpdateRequestModel,
  ClearPaymentRequestModel,
  MicroserviceManualInvoiceRequestModel,
  AddressModel,
  AddOnPaymentObject
}
export default PaymentMilestoneUpdateRequestModel;
