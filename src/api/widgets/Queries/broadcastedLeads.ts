import { authenticate } from "../../../core/authControl/verifyAuthUseCase"
import { broadcastedLeadsRatio } from "../../../domain/services/widgetServices/broadcastedLeadsRatio";

export const broadcastedLeads = async (root, args, context) => {

    let broadcastedLeadsResponse;

    try {
        let res;
        const user = await authenticate(context, "DD")
        switch (user.profile.access_level) {
            case 0:
            case 1:
                res = await broadcastedLeadsRatio(user)
                break;
            default:
                broadcastedLeadsResponse = { code: 200, message: "Dashboards will be added soon for this profile" }
                return broadcastedLeadsResponse;

        }
        broadcastedLeadsResponse = { code: 200, message: "success", leads: res }
        return broadcastedLeadsResponse;

    } catch (error) {
        broadcastedLeadsResponse = { code: 400, message: error.message }
        return broadcastedLeadsResponse;

    }
};
