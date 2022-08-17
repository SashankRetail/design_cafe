import HttpError from "standard-http-error";
import jwt from "jsonwebtoken";
import { sign } from "../../../core/authControl/JwtAuthControl";
import { prisma } from "../../../prismaConfig";
import { createPermissionsJson } from "../utilities";

export const reIssueAccessToken = async (_root, args, _context) => {
  try {
    const token = args.refreshToken;
    const userInfo = jwt.verify(token, process.env.jwtSecretRefreshToken, {
      ignoreExpiration: true,
    });

    if (!userInfo.payload.designCafeEmail) {
      throw new HttpError(500, "Something went wrong");
    }

    const email = userInfo?.payload?.designCafeEmail?.toLowerCase();
    const user = await prisma.dc_users.findFirst({
      where: { designcafeemail: email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new HttpError(401, "User not found");
    }

    const rfToken = user?.refreshtoken;
    if (rfToken !== token) {
      await prisma.dc_users.update({
        where: { userid: user?.userid },
        data: {
          refreshtoken: null,
        },
      });
      throw new HttpError(400, "Bad request");
    }

    const dateNow = new Date();
    const utcSeconds = userInfo.exp;
    const expiry = new Date(0);
    expiry.setUTCSeconds(utcSeconds);
    const data: any = {};
    if (expiry < dateNow) {
      await prisma.dc_users.update({
        where: { userid: user?.userid },
        data: {
          refreshtoken: null,
        },
      });
      throw new HttpError(440, "Session expired. Please re-login");
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

    const firstName = user.firstname ? user.firstname.trim() : "";
    const middleName = user.middlename ? user.middlename.trim() : "";
    const lastName = user.lastname ? user.lastname.trim() : "";
    const userName = `${firstName}${
      middleName ? " " + middleName + " " : " "
    }${lastName}`;

    data.role = user?.profile?.profile_name;
    data.roleId = user?.profileid;
    data.loginToken = loginToken;
    data.refreshToken = refreshToken;
    data.userName = userName;
    data.email = user?.designcafeemail;

    await prisma.dc_users.update({
      where: { userid: user?.userid },
      data: {
        lastlogindate: new Date(),
        refreshtoken: refreshToken,
      },
    });

    return { code: 200, message: "success", data };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
