import { google } from "googleapis";

export const GoogleOAuth = ({ clientId, clientSecret, redirectionUrl }) => {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectionUrl
  );

  google.fitness({
    version: "v1",
    auth: oauth2Client,
  });

  const getAuthorizeUrl = (scope) => {
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scope,
      prompt: "consent",
    });
  };

  const getAccessToken = async (code) => {
    try {
      const response = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(response.tokens);
      return response.tokens;
    } catch (error) {
      console.error(error)
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      oauth2Client.refreshAccessToken((err, resp) => {
        return {
          refreshToken: resp.refresh_token,
          accessToken: resp.access_token,
        };
      });
    } catch (error) {
      console.error(error)
      throw error;
    }
  };

  return { getAuthorizeUrl, getAccessToken, refreshAccessToken };
};
