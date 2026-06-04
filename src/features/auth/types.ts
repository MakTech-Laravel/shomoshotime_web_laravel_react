export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
}

export type VerifyOtpPayload = {
  email: string
  otp: string
}

export type PasswordResetOtpPayload = {
  email: string
}
