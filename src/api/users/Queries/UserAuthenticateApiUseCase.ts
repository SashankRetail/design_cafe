import { GoogleOAuth } from "../../../domain/services/oAuth/GoogleOAuth";

export const googleAuthorize = () => {
  try {
    const client = GoogleOAuth({
      clientId: process.env.googleAuthClientId,
      clientSecret: process.env.googleAuthSecretKey,
      redirectionUrl: process.env.googleAuthCallbackUrl,
    });

    const url = client.getAuthorizeUrl([
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ]);

    return { code: 200, message: "success", url: url };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
