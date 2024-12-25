import { ApiProperty } from "@nestjs/swagger";

export class RequestOtpDto {
  @ApiProperty({
    description: "Phone number to send OTP to",
    example: "+61412345678",
  })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: "Phone number to verify",
    example: "+61412345678",
  })
  phoneNumber: string;

  @ApiProperty({
    description: "OTP code received via SMS",
    example: "123456",
  })
  otp: string;
}

export class LoginDto {
  @ApiProperty({
    description: "Phone number to login with",
    example: "+61412345678",
  })
  phoneNumber: string;

  @ApiProperty({
    description: "OTP code received via SMS",
    example: "123456",
  })
  otp: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: "Login successful." })
  message: string;

  @ApiProperty({
    example: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  })
  data: {
    accessToken: string;
  };
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: "Tokens refreshed successfully." })
  message: string;

  @ApiProperty({
    example: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  })
  data: {
    accessToken: string;
  };
}
