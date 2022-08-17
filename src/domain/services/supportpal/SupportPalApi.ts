import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
const btoa = require("btoa");

class SupportPalApicopy extends RESTDataSource {


    constructor() {
        super();
        this.baseURL = process.env.supportPalUrl;
        this.initialize({}); // calling initialize() function with empty object is the key
    }
    deleteCacheForRequest(request: Request) {
       this.memoizedResults.delete(this.cacheKeyFor(request));
    }

    didReceiveResponse(response: Response, request: Request) {
        this.deleteCacheForRequest(request);
        return super.didReceiveResponse(response, request);
    }

    didEncounterError(error: Error, request: Request) {
        this.deleteCacheForRequest(request);
        return super.didEncounterError(error, request);
    }

    willSendRequest(request: RequestOptions) {
        request.headers.set('Content-Type', "application/json");
        request.headers.set('Cache-Control', "no-cache");
        request.headers.set('Authorization', 'Basic ' + btoa('BU!VO!pUe!2JJ9tO!com7I35oQi5xSi9:DC@123'))
        console.log(87, JSON.stringify(request.headers))
    }

    async getFromSupportPalApi(url) {
        const data = await this.get(url)
        return data
    }
    async postToSupportPalApi(url, body) {
        const data = await this.post(url,
            body
        )
        return data
    }
    async updateToSupportPalApi(url, body) {
        const data = await this.put(url,
            body
        )
        return data
    }
}
export default SupportPalApicopy
