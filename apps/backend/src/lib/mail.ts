import { Resend } from "resend";
import { parseISTDate } from "../services/phhc";

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
      subject: "Your Magic Login Link | Japsehaj Singh",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #ece7d1; margin: 0; padding: 40px 0; color: #4a3f2b; }
            .container { max-width: 600px; margin: 0 auto; background-color: #fbfaf6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 63, 43, 0.1); border: 1px solid #dbcea5; }
            .header { background: linear-gradient(135deg, #8a7650 0%, #6b5a3a 100%); padding: 32px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
            .content { padding: 40px; text-align: center; line-height: 1.6; }
            .button { display: inline-block; padding: 14px 32px; background-color: #8a7650; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 24px 0; box-shadow: 0 4px 12px rgba(138, 118, 80, 0.3); }
            .footer { padding: 32px; text-align: center; font-size: 12px; color: #6a715c; border-top: 1px solid #f4f1e5; }
            .link-text { word-break: break-all; color: #8a7650; font-size: 13px; margin-top: 20px; }
          </style>
        </head>
        <body class="body">
          <div class="container">
            <div class="header">
              <h1>JAPSEHAJ SINGH</h1>
            </div>
            <div class="content">
              <h2 style="margin-top: 0;">Sign in to your account</h2>
              <p>Click the button below to log in to the portal. This link will expire in 15 minutes for your security.</p>
              <a href="${magicLink}" class="button">Sign In to Dashboard</a>
              <p style="color: #6a715c; font-size: 14px;">If you didn't request this login, you can safely ignore this email.</p>
              <div class="link-text">
                <p>Or copy and paste this URL:</p>
                <a href="${magicLink}" style="color: #8a7650;">${magicLink}</a>
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Japsehaj Singh Legal Office. All rights reserved.
              <div style="display: none; visibility: hidden; opacity: 0; font-size: 1px; color: #fbfaf6; line-height: 1px; max-height: 0px; max-width: 0px; overflow: hidden;">
                Unique ID: ${Date.now()}-${Math.random().toString(36).substring(2, 9)}
              </div>
            </div>
          </div>
        </body>
        </html>
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
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #ece7d1; margin: 0; padding: 40px 0; color: #4a3f2b; }
            .container { max-width: 600px; margin: 0 auto; background-color: #fbfaf6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 63, 43, 0.1); border: 1px solid #dbcea5; }
            .header { background: linear-gradient(135deg, #8a7650 0%, #6b5a3a 100%); padding: 32px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
            .content { padding: 40px; text-align: center; line-height: 1.6; }
            .button { display: inline-block; padding: 14px 32px; background-color: #8a7650; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; margin: 24px 0; box-shadow: 0 4px 12px rgba(138, 118, 80, 0.3); }
            .footer { padding: 32px; text-align: center; font-size: 12px; color: #6a715c; border-top: 1px solid #f4f1e5; }
            .highlight { color: #8a7650; font-weight: bold; }
          </style>
        </head>
        <body class="body">
          <div class="container">
            <div class="header">
              <h1>JAPSEHAJ SINGH</h1>
            </div>
            <div class="content">
              <h2 style="margin-top: 0;">Case Shared With You</h2>
              <p><span class="highlight">${sharerName}</span> has shared a legal case with you.</p>
              <p>Click the button below to view the case details and save it to your account.</p>
              <a href="${shareLink}" class="button">View Shared Case</a>
              <p style="color: #6a715c; font-size: 14px;">If you don't have an account, you can sign in with your email to access it.</p>
              <div style="word-break: break-all; color: #8a7650; font-size: 13px; margin-top: 20px;">
                <p>Or copy and paste this URL:</p>
                <a href="${shareLink}" style="color: #8a7650;">${shareLink}</a>
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Japsehaj Singh Legal Office. All rights reserved.
              <div style="display: none; visibility: hidden; opacity: 0; font-size: 1px; color: #fbfaf6; line-height: 1px; max-height: 0px; max-width: 0px; overflow: hidden;">
                Unique ID: ${Date.now()}-${Math.random().toString(36).substring(2, 9)}
              </div>
            </div>
          </div>
        </body>
        </html>
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
    const istNow = parseISTDate(new Date().toISOString())!;
    const dateString = istNow.toLocaleDateString("en-IN");
    const { data, error } = await resend.emails.send({
      from: "reports@resend.pardhan.cc",
      to: [email],
      subject: `Daily Cases Export - ${dateString}`,
      attachments: [
        {
          filename: `cases_export_${parseISTDate(new Date().toISOString())!.toISOString().split("T")[0]}.xlsx`,
          content: excelBuffer,
        },
      ],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #ece7d1; margin: 0; padding: 40px 0; color: #4a3f2b; }
            .container { max-width: 600px; margin: 0 auto; background-color: #fbfaf6; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 63, 43, 0.1); border: 1px solid #dbcea5; }
            .header { background: linear-gradient(135deg, #8a7650 0%, #6b5a3a 100%); padding: 32px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-family: 'Playfair Display', serif; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
            .content { padding: 40px; text-align: center; line-height: 1.6; }
            .footer { padding: 32px; text-align: center; font-size: 12px; color: #6a715c; border-top: 1px solid #f4f1e5; }
          </style>
        </head>
        <body class="body">
          <div class="container">
            <div class="header">
              <h1>JAPSEHAJ SINGH</h1>
            </div>
            <div class="content">
              <h2 style="margin-top: 0;">Daily Cases Export</h2>
              <p>Please find the attached Excel sheet containing the details of all cases assigned to users as of today, <strong>${dateString}</strong>.</p>
              <p>This export includes the information required to search cases on the PHHC website.</p>
              <div style="background-color: #f4f1e5; padding: 20px; border-radius: 8px; margin-top: 24px;">
                <p style="margin: 0; font-size: 14px; color: #6a715c;">This is an automated administrative report.</p>
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Japsehaj Singh Legal Office. All rights reserved.
              <div style="display: none; visibility: hidden; opacity: 0; font-size: 1px; color: #fbfaf6; line-height: 1px; max-height: 0px; max-width: 0px; overflow: hidden;">
                Unique ID: ${Date.now()}-${Math.random().toString(36).substring(2, 9)}
              </div>
            </div>
          </div>
        </body>
        </html>
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
