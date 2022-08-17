import { RESTDataSource,RequestOptions } from 'apollo-datasource-rest';

class GenerateInvoicenewflow extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = process.env.apiEndpoint;
    }
    willSendRequest(request: RequestOptions) {
        request.headers.set('Authorization',this.context.headers.authorization);
    }
    async generateInvoiceNewFlowData(args) {
    const {invoiceData} = args;
    const {milestone,currentProjectValue,clientID,category,currentModularValue,currentSiteServicesValue,baseAmount,additionalCharge,status} = invoiceData;
    return  this.post('generateNewProjectInvoice',{
        // request
        invoiceData:{
            milestone,
            currentProjectValue,
            clientID,
            category,
            currentModularValue,
            currentSiteServicesValue,
            baseAmount,
            additionalCharge,
            status

        }
    }
      )
    }
}
export default GenerateInvoicenewflow
