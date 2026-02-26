import { Resend } from 'resend';

export const sendMagicLink = async (email: string, token: string) => {
    console.log(`Sending magic link to: ${email}`);
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const magicLink = `${process.env.FRONTEND_URL}/verify-magic-link?token=${token}`;

    if (!resend) {
        console.warn('Skipping email send: RESEND_API_KEY is not set.');
        console.log('Magic Link:', magicLink);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'auth@resend.pardhan.cc',
            to: [email],
            subject: 'Your Magic Login Link',
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
            console.error('Resend API error:', JSON.stringify(error, null, 2));
            throw new Error(`Failed to send email: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Mail service error:', error);
        throw error;
    }
};
