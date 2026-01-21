type TemplateArgs = { code: string | number; appName: string };
export const emailTemplate = ({ code, appName = "Shimanto" }: TemplateArgs) => {
  const html = `<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <div style="max-width:560px;margin:0 auto;padding:24px;">
          <div style="background:#ffffff;border-radius:14px;padding:28px;box-shadow:0 6px 18px rgba(17,24,39,0.08);">
            <div style="font-size:14px;color:#6b7280;margin-bottom:10px;">${appName}</div>
            <h1 style="margin:0 0 10px;font-size:22px;line-height:1.2;color:#111827;">
              Verify your email
            </h1>
    
            <div style="background:#f3f4f6;border:1px dashed #d1d5db;border-radius:12px;padding:18px;text-align:center;margin:18px 0;">
              <div style="font-size:12px;color:#6b7280;margin-bottom:6px;letter-spacing:0.08em;text-transform:uppercase;">
                Verification code
              </div>
              <div style="font-size:32px;font-weight:700;letter-spacing:0.22em;color:#111827;">
                ${code}
              </div>
            </div>
    
            <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b7280;">
              This code expires in <strong style="color:#111827;">2 minute(s)</strong>.
            </p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
              If you didn’t request this, you can safely ignore this email.
            </p>
    
          </div>
    
          <div style="text-align:center;font-size:12px;color:#9ca3af;margin-top:14px;">
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
          </div>
        </div>
      </body>
      `;
  return html;
};

export const resetPassTemplate = ({ code }: TemplateArgs) => {
  const html = `
     <div style="font-family: Arial, Helvetica, sans-serif; background:#f6f8fb; padding: 24px;">
    <div style="max-width: 520px; margin: 0 auto; background:#ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e8eef5;">
      
      <h2 style="margin: 0 0 8px; color:#1f2937;">Reset your password</h2>
      <p style="margin: 0 0 16px; color:#4b5563; font-size: 14px; line-height: 1.6;">
        We received a request to reset your <b>Shimanto</b> password.
        Click the button below to set a new password.
      </p>

      <div style="text-align:center; margin: 24px 0;">
        <a href="${code}"
           style="display:inline-block; background:#111827; color:#ffffff; text-decoration:none; padding: 12px 18px; border-radius: 10px; font-size: 14px;">
          Reset Password
        </a>
      </div>

      <p style="margin: 0 0 10px; color:#6b7280; font-size: 13px; line-height: 1.6;">
        If the button doesn’t work, copy and paste this link into your browser:
      </p>

      <p style="margin: 0 0 16px; background:#f3f4f6; padding: 12px; border-radius: 10px; word-break: break-all; font-size: 13px;">
        <a href="${code}" style="color:#2563eb; text-decoration:none;">${code}</a>
      </p>

      <p style="margin: 0 0 6px; color:#6b7280; font-size: 13px;">
        This link will expire soon. If you didn’t request a password reset, you can safely ignore this email.
      </p>

      <hr style="border:none; border-top:1px solid #e5e7eb; margin: 18px 0;" />

      <p style="margin:0; color:#9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} Shimanto. All rights reserved.
      </p>
    </div>
  </div>
  `;
  return html;
};

export const successfullVerifyTemplate = ({
  code,
  appName = "Shimanto",
}: TemplateArgs) => {
  const html = `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verified</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .header {
        background: #22c55e;
        color: #ffffff;
        text-align: center;
        padding: 24px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 32px;
        color: #333333;
        line-height: 1.6;
      }
      .content h2 {
        margin-top: 0;
        color: #111827;
      }
      .success-box {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        padding: 16px;
        border-radius: 6px;
        margin: 24px 0;
        text-align: center;
        font-weight: bold;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #6b7280;
        background: #f9fafb;
      }
      .footer a {
        color: #6b7280;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Email Verified</h1>
      </div>

      <div class="content">
        <h2>Hello ${code},</h2>

        <p>
          Great news! Your email address has been successfully verified.
        </p>

        <div class="success-box">
          ✅ Your account is now fully activated
        </div>

        <p>
          You can now access all features of your account without any
          restrictions.
        </p>

        <p>
          If you did not perform this action, please contact our support team
          immediately.
        </p>

        <p>Thanks for joining us,<br /><strong>${appName}</strong></p>
      </div>

      <div class="footer">
        <p>
          © ${appName}. All rights reserved.
        </p>
        <p>
          <a href="https://shimanto.dev">Contact Support</a>
        </p>
      </div>
    </div>
  </body>
</html>

  `;

  return html;
};
