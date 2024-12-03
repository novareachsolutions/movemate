import { Injectable } from "@nestjs/common";
import { createHmac } from "crypto";

@Injectable()
export class OtpService {
  generateOTP(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  generateSecret(otp: string): string {
    const hmac = createHmac("sha256", otp);
    return hmac.digest("base64");
  }

  verifyOTP(otp: string, secret: string): boolean {
    const generatedSecret = this.generateSecret(otp);
    return secret === generatedSecret;
  }
}
