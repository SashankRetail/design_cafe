import { prisma } from "../../../prismaConfig";

export const getAllProfiles = async () => {
    let profileResponseObj
try{
    const profiles = await prisma.dc_profile.findMany();
    profileResponseObj = { code: 200, message: "success",data:profiles}
    return profileResponseObj
}catch (error) {
    profileResponseObj = { code: 400, message: error.message }
    return profileResponseObj
  }
}
