import nodemailer from "nodemailer";

/**
 * Email & OTP Dispatcher for Eshara Naturals
 * Supports Nodemailer SMTP (Gmail, Hostinger, Zoho, cPanel, etc.), Resend API, Brevo, and Development Fallback.
 */

export interface SendOtpEmailParams {
  toEmail: string;
  customerName?: string;
  otp: string;
}

export interface SendOtpResponse {
  success: boolean;
  provider: string;
  error?: string;
  devOtp?: string;
}

export async function sendOtpEmail(params: SendOtpEmailParams): Promise<SendOtpResponse> {
  const { toEmail, customerName = "Valued Customer", otp } = params;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || "SHYN.ISH <care@shynish.com>";
  const fromAddress = fromEmail.includes("<") ? fromEmail : `SHYN.ISH <${fromEmail}>`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #141312; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #EAE5DC; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .logo { text-align: center; margin-bottom: 24px; }
          .otp-box { background: #FAF8F5; border: 2px dashed #C5A059; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
          .otp-code { font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #141312; }
          .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #7A7A7A; border-top: 1px solid #EAE5DC; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="${siteUrl}/assets/shyn-logo.png" alt="SHYN.ISH" width="170" style="display:block;margin:0 auto 10px;max-width:100%;height:auto;" />
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C5A059; margin-top: 4px; font-weight: 500;">Everyday Shine. Effortless Style.</p>
          </div>

          <h3 style="font-size: 18px; margin-bottom: 8px; color: #141312;">Password Reset Verification Code</h3>
          <p style="font-size: 14px; color: #4A4A4A; line-height: 1.5;">
            Hello ${customerName},<br><br>
            We received a request to reset the password for your SHYN.ISH account. Use the 6-digit verification code below to complete your password reset:
          </p>

          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #7A7A7A; text-transform: uppercase; letter-spacing: 1px;">Valid for 15 minutes</p>
          </div>

          <p style="font-size: 13px; color: #666; line-height: 1.5;">
            If you did not request a password reset, you can safely ignore this email. Your account credentials remain secure.
          </p>

          <div class="footer">
            &copy; ${new Date().getFullYear()} SHYN.ISH. All rights reserved.<br>
            <a href="${siteUrl}" style="color: #C5A059; text-decoration: none; font-weight: 500;">shynish.com</a>
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Check SMTP credentials (Gmail, Custom SMTP, Hostinger, Zoho, etc.)
  const smtpHost = process.env.SMTP_HOST || (process.env.GMAIL_USER ? "smtp.gmail.com" : undefined);
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `${otp} is your SHYN.ISH verification code`,
        text: `Your SHYN.ISH password reset OTP is ${otp}. It is valid for 15 minutes.`,
        html: emailHtml,
      });

      console.log(`[Email Service] Sent OTP email to ${toEmail} via SMTP (${smtpHost})`);
      return { success: true, provider: "SMTP" };
    } catch (err: any) {
      console.error(`[Email Service] SMTP error:`, err);
    }
  }

  // 2. Check Resend API
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      // Try sending with configured fromEmail or default onboarding@resend.dev
      const initialFrom = process.env.RESEND_FROM_EMAIL || fromAddress;
      
      let response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: initialFrom.includes("@") ? initialFrom : "SHYN.ISH <onboarding@resend.dev>",
          to: toEmail,
          subject: `${otp} is your SHYN.ISH verification code`,
          html: emailHtml,
        }),
      });

      // If failed due to unverified custom domain, auto-retry with Resend's default test address
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Email Service] Resend first attempt failed (${response.status}): ${errorText}`);

        if (response.status === 403 || errorText.toLowerCase().includes("domain") || errorText.toLowerCase().includes("verify")) {
          console.log(`[Email Service] Retrying Resend with onboarding@resend.dev...`);
          response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Eshara Naturals <onboarding@resend.dev>",
              to: toEmail,
              subject: `${otp} is your Eshara Naturals verification code`,
              html: emailHtml,
            }),
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        console.log(`[Email Service] Sent OTP email to ${toEmail} via Resend (ID: ${data.id})`);
        return { success: true, provider: "RESEND" };
      } else {
        const errorData = await response.text();
        console.error(`[Email Service] Resend API failed (${response.status}):`, errorData);
        let parsedError = errorData;
        try {
          const json = JSON.parse(errorData);
          parsedError = json.message || errorData;
        } catch {}
        
        return { 
          success: false, 
          provider: "RESEND", 
          error: `Resend: ${parsedError}`,
          devOtp: process.env.NODE_ENV !== "production" ? otp : undefined 
        };
      }
    } catch (err: any) {
      console.error(`[Email Service] Resend network error:`, err);
    }
  }

  // 3. Check Brevo API
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "SHYN.ISH", email: process.env.BREVO_SENDER_EMAIL || "care@shynish.com" },
          to: [{ email: toEmail, name: customerName }],
          subject: `${otp} is your SHYN.ISH verification code`,
          htmlContent: emailHtml,
        }),
      });

      if (response.ok) {
        console.log(`[Email Service] Sent OTP email to ${toEmail} via Brevo`);
        return { success: true, provider: "BREVO" };
      }
    } catch (err: any) {
      console.error(`[Email Service] Brevo error:`, err);
    }
  }

  // 4. Development Fallback (Logged to console when no email provider keys are set in .env)
  console.log(`\n======================================================`);
  console.log(`🔑 [SHYN.ISH PASSWORD RESET OTP GENERATED]`);
  console.log(`📧 Recipient: ${toEmail}`);
  console.log(`🔢 OTP Code: ${otp}`);
  console.log(`⚠️  Note: Configure SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) or RESEND_API_KEY in .env to deliver live emails.`);
  console.log(`======================================================\n`);

  return { 
    success: true, 
    provider: "DEVELOPMENT_FALLBACK",
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined 
  };
}
