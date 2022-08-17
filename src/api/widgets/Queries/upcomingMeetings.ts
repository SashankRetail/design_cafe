import { authenticate } from "../../../core/authControl/verifyAuthUseCase"
import { upcomingMeetingsRatio } from "../../../domain/services/widgetServices/upcomingMeetingsRatio";

export const upcomingMeetings = async (root, args, context) => {

    let upcomingMeetingsResponse;


    try {
        let res;
        const user = await authenticate(context, "DD")
        switch (user.profile.access_level) {
            case 0:
            case 1:
                res = await upcomingMeetingsRatio(user, args.timeperiod)
                break;
            default:
                upcomingMeetingsResponse = { code: 200, message: "Dashboards will be added soon for this profile" }
                return upcomingMeetingsResponse;


        }
        upcomingMeetingsResponse = { code: 200, message: "success", data: res.upcomingMeeting }
        return upcomingMeetingsResponse;

    } catch (error) {
        upcomingMeetingsResponse = { code: 400, message: error.message }
        return upcomingMeetingsResponse;
    }
};
