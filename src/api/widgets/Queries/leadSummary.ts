import { authenticate } from "../../../core/authControl/verifyAuthUseCase"
import { leadSummaryRatio } from "../../../domain/services/widgetServices/leadSummaryRatio"

export const leadSummary = async (root, args, context) => {

    const { month } = args;
    let leadSummaryResponse;

    try {
        let res;
        const user = await authenticate(context, "DD")
        switch (user.profile.access_level) {
            case 0:
            case 1:
                res = await leadSummaryRatio(user, month)
                break;
            default:
                leadSummaryResponse = { code: 200, message: "Dashboards will be added soon for this profile" }
                return leadSummaryResponse;
        }

        leadSummaryResponse = { code: 200, message: "success", data: res }
        return leadSummaryResponse;
    } catch (error) {
        leadSummaryResponse = { code: 200, message: error.message }
        return leadSummaryResponse;

    }
};
