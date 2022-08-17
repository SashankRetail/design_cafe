import { prisma } from "../../../prismaConfig";
import { getUser } from "../../users/Mutations/GetUser";
import DesignerAssignStatus from "../../../domain/enumerations/DesingerAssignStatus";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { ProfileTypeEnumCode } from "../../../domain/enumerations/ProfileTypeEnumUtil";

export const updateDesigner = async (root, args, context) => {
  let updateDesignerResponseObj;

  try {
    await authenticate(context, "DD");

    const { designerId, leadSfId, opportunitySfId } = args;
    const fetchedUser = await getUser(designerId);
    let user;
    if (fetchedUser.length > 0) {
      user = fetchedUser[0];
    } else {
      updateDesignerResponseObj = {
        code: 400,
        message: "No Designer found with given id",
      };
      return updateDesignerResponseObj;
    }
    let teamAssignedToUser, name;

    if (user.profileid === ProfileTypeEnumCode.STUDIO_MANAGER_DP ||
      user.profileid === ProfileTypeEnumCode.IN_HOUSE_DESIGNER ||
      user.profileid === ProfileTypeEnumCode.ASSOCIATE_STUDIO_MANAGER ||
      user.profileid === ProfileTypeEnumCode.STUDIO_MANAGER ||
      user.profileid === ProfileTypeEnumCode.DESIGN_PARTNER
      ) {
      teamAssignedToUser = user.teams ? user.teams[0].name : null;
      const middleName = user.middlename ? user.middlename.trim() : "";
      const lastName = user.lastname ? user.lastname.trim() : "";
      name = `${user.firstname?.trim()}${
        middleName ? " " + middleName + " " : " "
      }${lastName}`;
      console.log(56, name);
    } else {
      updateDesignerResponseObj = {
        code: 400,
        message: "Invalid Designer Id Provided",
      };
      return updateDesignerResponseObj;
    }

    if (leadSfId) {
      await prisma.lead.update({
        where: {
          sfid: leadSfId,
        },
        data: {
          design_user__c: user.salesforceuserid,
          design_user_name__c: name,
          designer_team_name__c: teamAssignedToUser,
          has_designer_accepted__c: DesignerAssignStatus.PENDING,
          broadcast_status__c: "3"
        },
      });
    } else if (opportunitySfId) {
      await prisma.opportunity.update({
        where: {
          sfid: opportunitySfId,
        },
        data: {
          design_user__c: user.salesforceuserid,
          design_user_name__c: name,
          studio_name__c: teamAssignedToUser,
        },
      });
    }
    updateDesignerResponseObj = { code: 200, message: "success" };
    return updateDesignerResponseObj;
  } catch (error) {
    updateDesignerResponseObj = { code: 400, message: error.message };
    return updateDesignerResponseObj;
  }
};
