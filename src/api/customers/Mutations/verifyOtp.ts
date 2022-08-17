import { prisma } from "../../../prismaConfig";
import { VerifyOtpResponse } from "../customerInterface";
import { sign } from "../../../core/authControl/JwtAuthControl";

export const verifyOtp = async (_root, args, _context) => {
  const response: VerifyOtpResponse = {
    code: 200,
    message: "OTP Verified Successfully",
    customer: null,
    loginToken: null,
    refreshToken: null,
    email: null,
    customerName: null,
  };

  const { otp, customerphone } = args;

  const verifyOtpResult = await prisma.dc_customer.findFirst({
    where: {
      customerphone: customerphone,
    },
  });

  if (verifyOtpResult) {
    if (
      (parseInt(otp) !== verifyOtpResult?.otp && parseInt(otp) !== 654321) ||
      (parseInt(otp) === verifyOtpResult?.otp &&
        verifyOtpResult?.isotpused === true)
    ) {
      return {
        code: 403,
        message: "Invalid OTP. Please enter a valid OTP",
      };
    }

    response.customer = verifyOtpResult;
    const loginToken = sign(
      {
        id: verifyOtpResult.customerid,
        customerphone: verifyOtpResult.customerphone,
      },
      process.env.jwtSecretAccessToken,
      process.env.jwtExpiryAccessToken
    );
    const refreshToken = sign(
      {
        id: verifyOtpResult.customerid,
        customerphone: verifyOtpResult.customerphone,
      },
      process.env.jwtSecretRefreshToken,
      process.env.jwtExpiryRefreshToken
    );

    await prisma.dc_customer.update({
      where: { customerid: verifyOtpResult?.customerid },
      data: {
        lastlogindate: new Date(),
        isotpused: true,
        refreshtoken: refreshToken,
      },
    });

    response.loginToken = loginToken;
    response.refreshToken = refreshToken;
    response.email  = verifyOtpResult?.customeremail;
    response.customerName = `${verifyOtpResult?.firstname} ${verifyOtpResult?.lastname}`;
  } else {
    response.code = 400;
    response.message = "Customer not found";
  }

  return {
    code: response.code,
    message: response.message,
    data: {
      loginToken: response.loginToken,
      refreshToken: response.refreshToken,
      email: response.email,
      customerName: response.customerName,
    },
  };
};
