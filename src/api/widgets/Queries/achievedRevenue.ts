import { authenticate } from "../../../core/authControl/verifyAuthUseCase"
import { achievedRevenueRatio } from "../../../domain/services/widgetServices/achievedRevenueRatio";

export const achievedRevenue = async (root, args, context) => {
    let totalAchievedRevenueRespone;

    try {
        let res;
        const user = await authenticate(context, "DD")
        switch (user.profile.access_level) {
            case 0:
            case 1:
                res = await achievedRevenueRatio(user,args.month)
                break;
            default:
                totalAchievedRevenueRespone = { code: 200, message: "Dashboards will be added soon for this profile" }
                return totalAchievedRevenueRespone;

        }

        totalAchievedRevenueRespone = { code: 200, message: "success", totalachievedrevenue:res , monthlytarget:user.monthlytarget}
        return totalAchievedRevenueRespone;

    } catch (error) {
        totalAchievedRevenueRespone = { code: 400, message: error.message }
        return totalAchievedRevenueRespone;
    }
};
