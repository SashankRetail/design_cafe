import { prisma } from "../../../prismaConfig";

export const getProfileById = async (root, args, context) => {
    let profileResponseObj
try{
    const profiles = await prisma.dc_profile.findMany({where: { profileid: args.profileid }});
    profileResponseObj = { code: 200, message: "success",data:profiles}
    return profileResponseObj
}catch (error) {
    profileResponseObj = { code: 400, message: error.message }
    return profileResponseObj
  }
}
