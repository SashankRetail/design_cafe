
import HttpError from "standard-http-error";
import jwt from "jsonwebtoken";
import { sign } from "../../../core/authControl/JwtAuthControl";
import { prisma } from "../../../prismaConfig";

export const reIssueAccessTokenCD = async (_root, args, _context) => {
  try {
    const token = args.refreshToken;
    const userInfo = jwt.verify(token, process.env.jwtSecretRefreshToken, {
      ignoreExpiration: true,
    });

    if (!userInfo.payload.email){
      throw new HttpError(500, "Something went wrong");
    }

    const email = userInfo?.payload?.email?.toLowerCase();
    const user = await prisma.dc_customer.findFirst({
      where: { customeremail: email }
    });

    if (!user) {
      throw new HttpError(401, "User not found");
    }

    const rfToken = user?.refreshtoken;
    if (rfToken !== token) {
      await prisma.dc_customer.update({
        where: { customerid: user?.customerid },
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
    const Obj: any = {};
    if (expiry < dateNow) {
      await prisma.dc_customer.update({
        where: { customerid: user?.customerid },
        data: {
          refreshtoken: null,
        },
      });
      throw new HttpError(440, "Session expired. Please re-login");
    }
    const loginToken = sign(
      {
        id: user?.customerid,
        email: email,
      },
      process.env.jwtSecretAccessToken,
      process.env.jwtExpiryAccessToken
    );

    const refreshToken = sign(
      {
        id: user?.customerid,
        email: email,
      },
      process.env.jwtSecretRefreshToken,
      process.env.jwtExpiryRefreshToken
    );

    Obj.loginToken = loginToken;
    Obj.refreshToken = refreshToken;
    Obj.email = user?.customeremail;
    Obj.customerName = `${user?.firstname} ${user?.lastname}`;

    await prisma.dc_customer.update({
      where: { customerid: user?.customerid },
      data: {
        lastlogindate: new Date(),
        refreshtoken: refreshToken
      },
    });

    return { code: 200, message: "success", data: Obj };
  } catch (error) {
    console.error(error)
    throw new HttpError(500,error);
  }
};
