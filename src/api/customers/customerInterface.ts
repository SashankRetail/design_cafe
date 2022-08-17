export interface VerifyOtpResponse {
  code: number;
  message: string;
  customer: Object;
  token?: string;
  loginToken: string;
  refreshToken: string;
  email: string;
  customerName: string;
}
