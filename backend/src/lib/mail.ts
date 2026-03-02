import { Resend } from "resend";

export const sendMagicLink = async (email: string, token: string) => {
  console.log(`Sending magic link to: ${email}`);
  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;
  const magicLink = `${process.env.FRONTEND_URL}/verify-magic-link?token=${token}`;

  if (!resend) {
    console.warn("Skipping email send: RESEND_API_KEY is not set.");
    console.log("Magic Link:", magicLink);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "auth@resend.pardhan.cc",
      to: [email],
      subject: "Your Magic Login Link",
      html: `
                <h1>Login to Your Account</h1>
                <p>Click the link below to sign in. This link will expire in 15 minutes.</p>
                <a href="${magicLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Sign In</a>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${magicLink}</p>
            `,
    });

    if (error) {
      console.error("Resend API error:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Mail service error:", error);
    throw error;
  }
};

export const sendShareCaseEmail = async (
  email: string,
  caseId: string,
  sharerName: string,
) => {
  console.log(`Sending case sharing link to: ${email}`);
  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;
  const shareLink = `${process.env.FRONTEND_URL}/share/case/${caseId}`;

  if (!resend) {
    console.warn("Skipping email send: RESEND_API_KEY is not set.");
    console.log("Share Link:", shareLink);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "cases@resend.pardhan.cc",
      to: [email],
      subject: `${sharerName} shared a legal case with you`,
      html: `
                <h1>Legal Case Shared With You</h1>
                <p><strong>${sharerName}</strong> has shared a legal case from Munshi Ji with you.</p>
                <p>Click the button below to view the case details and save it to your account.</p>
                <a href="${shareLink}" style="display: inline-block; padding: 12px 24px; background-color: #ECE7D1; color: #1a1a1a; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid #d4cca4;">View Shared Case</a>
                <p>If you don't have an account, you can sign in with your email to access it.</p>
                <p>Or copy and paste this URL into your browser:</p>
                <p>${shareLink}</p>
            `,
    });

    if (error) {
      console.error("Resend API error:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Mail service sharing error:", error);
    throw error;
  }
};

export const sendAdminExportEmail = async (
  email: string,
  excelBuffer: Buffer,
) => {
  console.log(`Sending daily cases export to: ${email}`);
  const resendApiKey = process.env.RESEND_API_KEY;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  if (!resend) {
    console.warn("Skipping email send: RESEND_API_KEY is not set.");
    return;
  }

  try {
    const dateString = new Date().toLocaleDateString();
    const { data, error } = await resend.emails.send({
      from: "reports@resend.pardhan.cc",
      to: [email],
      subject: `Daily Cases Export - ${dateString}`,
      attachments: [
        {
          filename: `cases_export_${new Date().toISOString().split("T")[0]}.xlsx`,
          content: excelBuffer,
        },
      ],
      html: `
                <h1>Daily Cases Search Export</h1>
                <p>Please find the attached Excel sheet containing the details of all cases assigned to users as of today, ${dateString}.</p>
                <p>This export includes the information required to search cases on the PHHC website.</p>
            `,
    });

    if (error) {
      console.error("Resend API error:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Mail service export error:", error);
    throw error;
  }
};
