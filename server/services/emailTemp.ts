interface obj {
  code: number;
  appName: string;
}

export const emailTemplate = ({ code, appName }: obj) => {
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
