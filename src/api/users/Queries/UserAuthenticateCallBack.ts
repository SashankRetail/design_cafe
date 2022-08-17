import HttpError from "standard-http-error";
import { GoogleOAuth } from "../../../domain/services/oAuth/GoogleOAuth";
import {
  sign,
  decodeWithoutVerifying,
} from "../../../core/authControl/JwtAuthControl";
import { domainVerification } from "../../../core/authControl/verifyAuthUseCase";
import { prisma } from "../../../prismaConfig";
import { createPermissionsJson } from "../utilities";

export const googleAuthorizeCallBack = async (_root, args, _context) => {
  try {
    const client = GoogleOAuth({
      clientId: process.env.googleAuthClientId,
      clientSecret: process.env.googleAuthSecretKey,
      redirectionUrl: process.env.googleAuthCallbackUrl,
    });
    const code = args.code;
    const token = await client.getAccessToken(code);
    const userInfo = decodeWithoutVerifying(token?.id_token);

    if (!userInfo.email) {
      throw new HttpError(201, "Something went wrong, please contact admin.");
    }

    const email = userInfo.email.toLowerCase();
    // to verify if the email domain belongs to DesignCafe
    await domainVerification(email);

    const user = await prisma.dc_users.findFirst({
      where: { designcafeemail: email },
      include: {
        profile: true,
      },
    });
    if (!user) {
      throw new HttpError(
        401,
        "Sorry Couldn't find your account on the dashboard contact Admin if your account was not created yet, else check if you've logged in with the correct email address"
      );
    }

    const loginToken = sign(
      {
        id: user?.userid,
        designCafeEmail: email,
        role: user?.profile?.profile_name,
        permissions: createPermissionsJson(user?.profile?.permissions),
      },
      process.env.jwtSecretAccessToken,
      process.env.jwtExpiryAccessToken
    );

    const refreshToken = sign(
      {
        id: user?.userid,
        designCafeEmail: email,
        role: user?.profile?.profile_name,
      },
      process.env.jwtSecretRefreshToken,
      process.env.jwtExpiryRefreshToken
    );

    await prisma.dc_users.update({
      where: { userid: user?.userid },
      data: {
        lastlogindate: new Date(),
        refreshtoken: refreshToken,
      },
    });
    const firstName = user.firstname ? user.firstname.trim() : "";
    const middleName = user.middlename ? user.middlename.trim() : "";
    const lastName = user.lastname ? user.lastname.trim() : "";
    const userName = `${firstName}${
      middleName ? " " + middleName + " " : " "
    }${lastName}`;
    const data = {
      loginToken,
      refreshToken,
      role: user?.profile?.profile_name,
      roleId: user?.profileid,
      userName,
      email: user?.designcafeemail,
    };

    return { code: 200, message: "success", data };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
