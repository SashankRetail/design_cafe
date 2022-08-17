import { prisma } from "../../../prismaConfig";

export const updateProfile = async (root, args, context) => {
    let profileResponseObj
    const { profileid,profile_name, status,permissions,created_date, updated_at } = args;
    try {
        const updateprofile = await prisma.dc_profile.update({
      data: {
        profile_name:profile_name,
        status:status,
        permissions:permissions,
        created_date:created_date,
        updated_at:updated_at,
      },
      where: {
        profileid: profileid,
      },
    });
    profileResponseObj = { code: 200, message: "success",data:updateprofile}
    return profileResponseObj
   } catch (error) {
    profileResponseObj = { code: 400, message: error.message }
    return profileResponseObj
  }
  };
