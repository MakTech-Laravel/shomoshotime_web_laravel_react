export class PasswordSetupRequiredError extends Error {
  readonly email: string

  constructor(email: string, message?: string) {
    super(message ?? 'Password setup required for migrated account.')
    this.name = 'PasswordSetupRequiredError'
    this.email = email
  }
}
