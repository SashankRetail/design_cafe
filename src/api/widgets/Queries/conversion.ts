import { authenticate } from "../../../core/authControl/verifyAuthUseCase"
import { leadSummaryRatio } from "../../../domain/services/widgetServices/leadSummaryRatio";

export const conversion = async (root, args, context) => {

    const { month } = args;
    let conversionResponse;

    try {
        let res;
        const user = await authenticate(context, "DD")
        switch (user.profile.access_level) {
            case 0:
            case 1:
                res = await leadSummaryRatio(user, month)
                break;
            default:
                conversionResponse = { code: 200, message: "Dashboards will be added soon for this profile" }
                return conversionResponse;

        }
        conversionResponse = { code: 200, message: "success", percentage: res.percentage , totalMeetingDone: res.meetingDone,closedWon: res.closeWon }
        return conversionResponse

    } catch (error) {
        conversionResponse = { code: 400, message: error.message }
        return conversionResponse
    }
};
