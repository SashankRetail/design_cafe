import { prisma } from "../../../prismaConfig";
import { ProfileTypeEnumCode } from "../../../domain/enumerations/ProfileTypeEnumUtil";

export const getAllDesigners = async (_root, _args, _context) => {

    const getAllDesignersResponse = {
        code: 200,
        message: "success",
        designers: null
    }

    try {
        const whereCondition: any = {}
        whereCondition.OR = [];
        whereCondition.OR.push(
            { profileid: ProfileTypeEnumCode.STUDIO_MANAGER_DP },
            { profileid: ProfileTypeEnumCode.IN_HOUSE_DESIGNER },
            { profileid: ProfileTypeEnumCode.ASSOCIATE_STUDIO_MANAGER },
            { profileid: ProfileTypeEnumCode.STUDIO_MANAGER },
            { profileid: ProfileTypeEnumCode.DESIGN_PARTNER })
        const allDesigners = await prisma.dc_users.findMany({
            where: whereCondition
        })
        console.log(allDesigners)
        getAllDesignersResponse.designers = allDesigners;

    }
    catch (e) {
        getAllDesignersResponse.code = 400;
        getAllDesignersResponse.message = e.message;
        getAllDesignersResponse.designers = null;
    }

    return getAllDesignersResponse;
}
