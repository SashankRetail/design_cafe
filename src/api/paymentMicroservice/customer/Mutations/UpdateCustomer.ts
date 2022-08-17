import { RESTDataSource,RequestOptions } from 'apollo-datasource-rest';

class UpdateCustomer extends RESTDataSource {
  constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;

      }
      willSendRequest(request: RequestOptions) {
        request.headers.set('Authorization',this.context.headers.authorization);
        console.log(request.headers)
      }
      // post
      async updateCustomerData(args) {
        const {PAN,l10n_in_gst_treatment,GST,customerPhone,customerName,customerEmail,customerBillingAddress} = args.customer;
        return  this.put('customer',{
        // request
        PAN,
        l10n_in_gst_treatment,
        GST,
        customerPhone,
        customerName,
        customerEmail,
        customerBillingAddress
     },
      )
    }
}
export default UpdateCustomer
