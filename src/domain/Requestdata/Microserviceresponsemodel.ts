class MicroserviceResponseModel {
    applicationId: string;
    projectID: string;
    paymentName: string;
    invoiceBreakUp: {
      baseAmount: number;
      SGST: number;
      CGST: number;
      IGST: number;
      totalTaxValue: number;
      totalAmount: number;
    };
    extraPaymentsInvoiceBreakup: [
      {
        paymentName: string;
        baseAmount: number;
        IGST: number;
        SGST: number;
        CGST: number;
        totalTaxValue: number;
        totalAmount: number;
        quantity: number;
      }
    ];
    invoiceDate: string;
    invoiceNumber: string;
    invoicePdf: string;
    paymentLink: string;
  }

    export default  MicroserviceResponseModel;
