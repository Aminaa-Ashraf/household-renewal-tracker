export function getAuthFlags() {
  return {
    googleEnabled: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
    magicLinkEnabled: Boolean(process.env.RESEND_API_KEY),
  };
}
