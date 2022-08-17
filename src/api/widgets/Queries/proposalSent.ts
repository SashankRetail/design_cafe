import { authenticate } from "../../../core/authControl/verifyAuthUseCase"
import { proposalSentRatio } from "../../../domain/services/widgetServices/proposalSentRatio";

export const proposalSent = async (root, args, context) => {
    let proposalSentResponse;

    const { month } = args;

    try {
        let res;
        const user = await authenticate(context, "DD")
        switch (user.profile.access_level) {
            case 0:
            case 1:
                res = await proposalSentRatio(user, month)
                break;
            default:
                proposalSentResponse = { code: 200, message: "Dashboards will be added soon for this profile" }
                return proposalSentResponse;

        }

        console.log(res)
        proposalSentResponse = { code: 200, message: "success", percentage: res.percentage,totalMeetingDone: res.totalMeetingDone , totalProposalSent: res.totalProposalSent}
        return proposalSentResponse;

    } catch (error) {
        proposalSentResponse = { code: 400, message: error.message }
        return proposalSentResponse;
    }
};
