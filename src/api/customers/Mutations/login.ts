import { prisma } from "../../../prismaConfig";
import * as msg91 from "msg91-api";
const crypto = require("crypto");

export const login = async (root, args, context) => {
  const { customerphone } = args;
  const loginResponseObj = {
    code: 200,
    message: "OTP has been sent to your registered number",
  };
  const fetchedCustomer = await prisma.dc_customer.findFirst({
    where: { customerphone: customerphone },
  });

  if (fetchedCustomer) {
    const otp = await generateOtp(customerphone);
    await prisma.dc_customer.update({
      where: {
        customerid: fetchedCustomer.customerid,
      },
      data: {
        otp: parseInt(otp),
        isotpused: false,
        generatedotptimestamp: new Date().toISOString(),
      },
    });
  } else {
    loginResponseObj.code = 400;
    loginResponseObj.message =
      "You do not have access to the dashboard. Please contact support at support@designcafe.com";
  }
  return loginResponseObj;
};

const generateOtp = async (customerphone) => {
  try {
    const random = crypto.randomInt(0, 999999);
    const otp = random.toString().padStart(6,0);
    console.log(otp);
    await sendOTP(customerphone, otp);
    return otp;
  } catch (error) {
    return error.message;
  }
};

const sendOTP = async (phoneNumber, otp) => {
  const smsSender = msg91(process.env.kSMSApiKey, process.env.kSMSSenderId, 4);
  const params = {
    otp: otp,
    email: "",
    otp_length: "4",
    otp_expiry: "15",
    userip: "",
    invisible: "",
    unicode: "",
    extra_param: "",
  };

  smsSender.sendOTP(
    `+91${phoneNumber}`,
    process.env.smsTemplateId,
    params,
    null,
    null
  );
};
