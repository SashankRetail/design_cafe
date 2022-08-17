import { authenticate } from "../../../core/authControl/verifyAuthUseCase"
import { totalActiveProjectsRatio } from "../../../domain/services/widgetServices/totalActiveProjectsRatio";

export const totalActiveProjects = async (root, args, context) => {
    let totalActiveProjectsResponse;

    try {
        let res;
        const user = await authenticate(context, "DD")
        switch (user.profile.access_level) {
            case 0:
            case 1:
                res = await totalActiveProjectsRatio(user)
                break;
            default:
                totalActiveProjectsResponse = { code: 200, message: "Dashboards will be added soon for this profile" }
                return totalActiveProjectsResponse;

        }

        console.log(res)
        totalActiveProjectsResponse = { code: 200, message: "success", data: res }
        return totalActiveProjectsResponse;

    } catch (error) {
        totalActiveProjectsResponse = { code: 400, message: error.message }
        return totalActiveProjectsResponse;
    }
};
