import { Router } from "express";
import nodemailer from "nodemailer";
import { emailLimiter } from "../middleware";

const router = Router();

router.post("/send-email", emailLimiter, async (req, res) => {
  try {
    const { to, subject, text, pdfAttachment } = req.body;
    if (!to) {
      return res.status(400).json({ error: "عنوان البريد المستلم مطلوب" });
    }
    
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions: any = {
      from: '"AI Letter Editor" <no-reply@example.com>',
      to,
      subject,
      text,
    };

    if (pdfAttachment) {
      const base64Data = pdfAttachment.replace(/^data:application\/pdf;base64,/, "");
      mailOptions.attachments = [
        {
          filename: 'Letter.pdf',
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'application/pdf',
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.json({ message: "Email sent successfully (Ethereal Preview available)", previewUrl: nodemailer.getTestMessageUrl(info) });
  } catch (error: any) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email: " + (error.message || error) });
  }
});

export default router;
