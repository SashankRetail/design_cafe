import { authenticate } from "../../../core/authControl/verifyAuthUseCase";

export const getUserDetailsByAuth = async (_parent, _args, context) => {
  const getUserByAuthResponse = { code: 200, message: "", data: null };
  try {
    const userDetails = await authenticate(context, "DD");
    getUserByAuthResponse.data = userDetails;
    getUserByAuthResponse.message = "Success";
  } catch (e) {
    getUserByAuthResponse.code = 400;
    getUserByAuthResponse.message = e.message;
  }
  return getUserByAuthResponse;
};
