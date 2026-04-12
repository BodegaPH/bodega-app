/**
 * Validates required environment variables at startup
 * Throws descriptive errors for missing critical configuration
 */
export function validateEnv() {
  const errors: string[] = [];

  // Critical variables
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required for database connection");
  }

  if (!process.env.NEXTAUTH_SECRET) {
    errors.push("NEXTAUTH_SECRET is required for session encryption");
  }

  if (process.env.NEXTAUTH_SECRET === "change-me") {
    errors.push(
      "NEXTAUTH_SECRET must be changed from default value. Generate a secure random string."
    );
  }

  if (!process.env.NEXTAUTH_URL) {
    errors.push(
      "NEXTAUTH_URL is required (e.g., http://localhost:3000 for dev, https://yourdomain.com for prod)"
    );
  }

  // Warnings for optional but recommended variables
  const warnings: string[] = [];

  const emailProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (emailProvider === "mailjet") {
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET || !process.env.MAILJET_FROM_EMAIL) {
      warnings.push(
        "EMAIL_PROVIDER=mailjet is set but MAILJET_API_KEY/MAILJET_API_SECRET/MAILJET_FROM_EMAIL are missing. Invite email delivery will fail."
      );
    }
  }

  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET
  ) {
    warnings.push(
      "Google OAuth not configured. Only credential-based auth will be available."
    );
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn("\n⚠️  Configuration Warnings:");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.warn("");
  }

  // Throw if critical errors exist
  if (errors.length > 0) {
    console.error("\n❌ Environment Configuration Errors:");
    errors.forEach((error) => console.error(`  - ${error}`));
    console.error(
      "\nPlease check your .env file and ensure all required variables are set.\n"
    );
    throw new Error("Invalid environment configuration");
  }

  console.log("✅ Environment variables validated successfully\n");
}
