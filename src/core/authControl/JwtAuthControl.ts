import jwt from "jsonwebtoken";
import HttpError from "standard-http-error";

export const sign = (valueToEncode, secret, expiresIn) => {
  try {
    const options = {
      expiresIn,
      issuer: "https://DesignCafe.com",
    };
    return jwt.sign({ payload: valueToEncode }, secret, options);
  } catch (error) {
    throw new HttpError(500, "InternalServerError");
  }
};

export const decode = (verifyToken, secret) => {
  try {
    const decoded = jwt.verify(verifyToken, secret, { ignoreExpiration: true });
    console.log(555,decoded)
    return decoded.payload;
  } catch (error) {
    throw new HttpError(401, "Unauthorized");
  }
};

export const decodeRequestHeader = (req, secret) => {
  try {
    const token = req.headers.authorization;
    return decode(token, secret);
  } catch (error) {
    throw new HttpError(401, "Unauthorized");
  }
};
export const decodeWithoutVerifying = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new HttpError(401, "Unauthorized");
  }
};
