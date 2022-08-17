

class MicroserviceInvoiceRequestModel {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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
  projectModularValue: number;
  projectSiteServicesValue: number;
  projectDecorValue: number;
  designerDetails;
  salesManagerDetails;
  studioName: string;
  paymentMilestoneID: string;
  customerShippingAddress: Object;
  customerBillingAddress: AddressModel;
  extraPayments: AddOnPaymentObject[];
}
class AddressModel {
  country: string;
  street: string;
  city: string;
  zipOrPostalCode: string;
  shippingState: string;
}
class AddOnPaymentObject {
  amount: number;
  paymentName: string;
  quantity: number;
}
class MicroserviceResponseModel {
  applicationid: string;
  projectid: string;
  paymentname: string;
  invoicebreakup: {
    baseamount: number;
    sgst: number;
    cgst: number;
    igst: number;
    totaltaxvalue: number;
    totalamount: number;
  }
  invoicedate: string;
  invoicenumber: string;
  invoicepdf: string;
  paymentlink: string;
}
class PaymentMilestoneUpdateRequestModel {
  invoicebaseamount: number;
  invoicenumber: string;
  invoicetotalamount: number;
  invoicetotaltaxamount: number;
  invoicetotalcgstaxamount: number;
  invoicetotalsgsttaxamount: number;
  invoicetotaligsttaxamount: number;
  invoicedate: string;
  invoiceurl: string;
  paymentlink: string;
  amountdue: number;
  totalpayableamount: number;
  milestoneamount: number;
  isfreezed: boolean;
  status: string;
}
enum PaymentStatusEnum {
  PAID = "Paid",
  PENDING = "Pending",
  PARTIAL_PAYMENT = "Paid Partially",
}
export {
  MicroserviceResponseModel,
  PaymentMilestoneUpdateRequestModel,
  AddressModel,
  AddOnPaymentObject
}

export default MicroserviceInvoiceRequestModel;
