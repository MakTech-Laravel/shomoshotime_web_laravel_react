export class WixUseForgotPasswordError extends Error {
  readonly email: string

  constructor(email: string, message?: string) {
    super(
      message ??
        'Welcome to our new platform! Your account has been transferred successfully. Before you can log in, please use the "Forgot Password" option to create a new password for your account.',
    )
    this.name = 'WixUseForgotPasswordError'
    this.email = email
  }
}

export const WIX_USE_FORGOT_PASSWORD_ACTION = 'WIX_USE_FORGOT_PASSWORD'
