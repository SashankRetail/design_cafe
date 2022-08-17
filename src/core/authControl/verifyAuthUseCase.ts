import HttpError from "standard-http-error";
import { prisma } from "../../prismaConfig";
import { decode } from "../authControl/JwtAuthControl";
import { ProfileTypeEnumNames } from "../../domain/enumerations/ProfileTypeEnums";

export function getAllRoleList() {
  return [
    ProfileTypeEnumNames.SYSTEM_ADMINISTRATOR,
    ProfileTypeEnumNames.IN_HOUSE_DESIGNER,
    ProfileTypeEnumNames.DESIGN_PARTNER,
    ProfileTypeEnumNames.ASSOCIATE_STUDIO_MANAGER,
    ProfileTypeEnumNames.STUDIO_MANAGER,
    ProfileTypeEnumNames.STUDIO_MANAGER_DP,
    ProfileTypeEnumNames.CENTER_DELIVERY_HEAD,
    ProfileTypeEnumNames.CITY_DELIVERY_HEAD,
    ProfileTypeEnumNames.ALL_INDIA_BUSINESS_HEAD,
    ProfileTypeEnumNames.CEO,
    ProfileTypeEnumNames.CHM_EXECUTIVE,
    ProfileTypeEnumNames.CHM_MANAGER,
    ProfileTypeEnumNames.SURVEY_EXECUTIVE,
    ProfileTypeEnumNames.SURVEY_MANAGER,
    // ProfileTypeEnumNames.THREE_D_DESIGNER_RENDERS,
    // ProfileTypeEnumNames.THREE_D_DESIGNER_SHELL,
    // ProfileTypeEnumNames.THREE_D_MANAGER,
    ProfileTypeEnumNames.FINANCE_EXECUTIVE,
    ProfileTypeEnumNames.FRANCHISE_OWNER,
  ];
}

export const domainVerification = async (email) => {
  try {
    console.log(575, email);
    const domain = email.split("@")[1];
    if (
      domain.toLowerCase() !== process.env.emailDomainDC &&
      domain.toLowerCase() !== process.env.emailDomainDCPartner
    ) {
      throw new HttpError(
        401,
        "Unauthorized, email should be a DesignCafe email."
      );
    }
  } catch (error) {
    console.error(error);
    throw new HttpError(500, error);
  }
};

export const authorize = async (requiredProfileTypes, user) => {
  try {
    if (requiredProfileTypes.indexOf(user?.profile?.profile_name) === -1) {
      console.log("BaseUseCase authorize error one");
      throw new HttpError(401, "Unauthorized");
    }
  } catch (error) {
    console.log("BaseUseCase authorize error", error);
    throw new HttpError(500, error);
  }
};

export const authenticate = async (context, app) => {
  try {
    const token = context.headers.authorization;
    if (!token) {
      throw new HttpError(401, "Unauthorized");
    }
    const payload = await decode(token, process.env.jwtSecretAccessToken);
    const id = payload?.id;
    console.log(payload);

    if (!id) {
      throw new HttpError(403, "Forbidden");
    }
    const dateNow = new Date();
    const utcSeconds = payload.exp;
    const expiry = new Date(0);
    expiry.setUTCSeconds(utcSeconds);
    if (expiry < dateNow) {
      throw new HttpError(498, "Token Expired");
    }

    let user;
    if (app === "CD") {
      user = await prisma.dc_customer.findFirst({
        where: { customerid: id },
      });
    } else if (app === "DD") {
      await domainVerification(payload.designCafeEmail);
      user = await prisma.dc_users.findFirst({
        where: { userid: id },
        include: {
          profile: true,
          users_city: true,
          users_experiencecenters: true,
          users_team: true,
        },
      });
    }
    if (user) {
      return user;
    } else {
      throw new HttpError(401, "UnAuthorized");
    }
  } catch (error) {
    console.error(error);
    throw new HttpError(401, error);
  }
};

export const authenticateDdCd = async (context) => {
  try {
    const accessToken = context.headers.authorization;
    if (!accessToken) {
      throw new HttpError(401, "Unauthorized");
    }
    const payloadData = await decode(
      accessToken,
      process.env.jwtSecretAccessToken
    );
    const id = payloadData?.id;

    if (!id) {
      throw new HttpError(403, "Forbidden");
    }
    const currentDate = new Date();
    const utcInSeconds = payloadData.exp;
    const expiresIn = new Date(0);
    expiresIn.setUTCSeconds(utcInSeconds);
    if (expiresIn < currentDate) {
      throw new HttpError(498, "Token Expired");
    }
    let customer;
    if (payloadData?.customerphone) {
      customer = await prisma.dc_customer.findFirst({
        where: { customerphone: payloadData?.customerphone },
      });
    }
    let user;
    if (payloadData?.designCafeEmail) {
      user = await prisma.dc_users.findFirst({
        where: { designcafeemail: payloadData.designCafeEmail },
        include: {
          users_city: true,
          users_experiencecenters: true,
          users_team: true,
        },
      });
    }
    if (user) {
      await domainVerification(payloadData.designCafeEmail);
    }
    if (customer || user) {
      return { user, customer };
    } else {
      throw new HttpError(401, "UnAuthorized");
    }
  } catch (error) {
    console.error(error);
    throw new HttpError(500, error);
  }
};
