import {prisma} from "../../../prismaConfig";

export const addProfile = async (root, args, context) => {
  let profileResponseObj
    const { profile_name,status,permissions} = args;
    try {
    const createprofile = await prisma.dc_profile.create({
        data: {
          profile_name,
          status,
          permissions:permissions,
          created_date:new Date(),
          updated_at: new Date()
        },
      });
      profileResponseObj = { code: 200, message: "success",data:createprofile}
      return profileResponseObj
    } catch (error) {
      profileResponseObj = { code: 400, message: error.message }
      return profileResponseObj
    }
}
