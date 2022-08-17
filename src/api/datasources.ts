import AuthenticationToken from './paymentMicroservice/authentication/Mutation/AuthenticationToken';
import AddPaymentRequests from './paymentMicroservice/paymentRequest/Mutations/AddPaymentRequests';
import UpdatePaymentRequests from './paymentMicroservice/paymentRequest/Mutations/UpdatePaymentRequests';
import DeletePaymentRequests from './paymentMicroservice/paymentRequest/Mutations/DeletePaymentRequests';
import AddPaymentReceipts from './paymentMicroservice/paymentReceipt/Mutation/AddPaymentReceipts';
import UpdatePaymentReceipts from './paymentMicroservice/paymentReceipt/Mutation/UpdatePaymentReceipts';
import DeletePaymentReceipts from './paymentMicroservice/paymentReceipt/Mutation/DeletePaymentreceipts';
import RazorpayGeneratePaymentLink from './paymentMicroservice/razorpay/Mutation/RazorpayGeneratePaymentLink';
import RazorpayWebhook from './paymentMicroservice/razorpay/Mutation/RazorpayWebhook';
import UpdateCustomer from './paymentMicroservice/customer/Mutations/UpdateCustomer';
import GenerateInvoicenewflow from './paymentMicroservice/invoice/Mutation/GenerateInvoicenewflow';

export const dataSources = () => ({
    AuthenticationToken:new AuthenticationToken(),

    AddPaymentRequests:new AddPaymentRequests(),
    UpdatePaymentRequests:new  UpdatePaymentRequests(),
    DeletePaymentRequests:new DeletePaymentRequests(),

    AddPaymentReceipts:new AddPaymentReceipts(),
    UpdatePaymentReceipts:new UpdatePaymentReceipts(),
    DeletePaymentReceipts:new DeletePaymentReceipts(),

    RazorpayGeneratePaymentLink:new RazorpayGeneratePaymentLink(),
    RazorpayWebhook:new RazorpayWebhook(),

    UpdateCustomer:new UpdateCustomer(),

    GenerateInvoicenewflow:new GenerateInvoicenewflow(),

})
