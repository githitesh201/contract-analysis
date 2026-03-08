import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend =
  RESEND_API_KEY && RESEND_API_KEY.trim().length > 0
    ? new Resend(RESEND_API_KEY)
    : null;

export const sendPremiumConfirmationEmail = async (
  userEmail: string,
  userName: string
) => {
  if (!resend) {
    return;
  }

  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: userEmail,
      subject: "Welcome to Premium",
      html: `<p>Hi ${userName},</p><p>Welcome to Premium. You're now a Premium user!</p>`,
    });
  } catch (error) {
    console.error(error);
  }
};
