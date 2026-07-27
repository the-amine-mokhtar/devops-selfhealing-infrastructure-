package tn.esprit.spring.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            message.setFrom("aminemokhtar2003@gmail.com");
            message.setRecipients(MimeMessage.RecipientType.TO, to);
            message.setSubject(subject, "UTF-8");
            message.setContent(htmlBody, "text/html; charset=UTF-8");
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }

    public String buildDeadlineAlertHtml(String consultantName, String clientName, String deadline, String status) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background-color:#f3f1eb;font-family:Inter,'Segoe UI',Arial,sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f3f1eb;padding:40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                                <tr>
                                    <td style="padding:32px 40px;background:linear-gradient(135deg,#212127 0%%,#2a2a32 100%%);">
                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <span style="display:inline-block;width:28px;height:28px;background:linear-gradient(135deg,#ffd100 0 72%%,transparent 72%% 100%%);transform:skewX(-18deg);margin-right:10px;vertical-align:middle;"></span>
                                                    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.08em;vertical-align:middle;">EY</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:32px 40px;">
                                        <h1 style="margin:0 0 8px;font-size:24px;color:#1d1d1b;">⚠ Deadline Overdue</h1>
                                        <p style="margin:0 0 20px;color:#6f6a60;font-size:15px;line-height:1.6;">The deadline for one of your engagements has passed.</p>
                                        <table width="100%%" cellpadding="12" cellspacing="0" style="background:#f7f6f2;border-radius:6px;margin-bottom:20px;">
                                            <tr>
                                                <td style="font-weight:700;color:#4b4740;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Consultant</td>
                                                <td style="color:#1d1d1b;font-weight:600;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="font-weight:700;color:#4b4740;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Client</td>
                                                <td style="color:#1d1d1b;font-weight:600;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="font-weight:700;color:#4b4740;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Deadline</td>
                                                <td style="color:#b64646;font-weight:700;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="font-weight:700;color:#4b4740;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Status</td>
                                                <td><span style="display:inline-block;padding:4px 12px;background:rgba(182,70,70,0.12);color:#b64646;font-weight:700;font-size:13px;">%s</span></td>
                                            </tr>
                                        </table>
                                        <p style="margin:0;color:#6f6a60;font-size:14px;line-height:1.6;">Please take immediate action to resolve this overdue engagement.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 40px;border-top:1px solid rgba(18,18,18,0.08);text-align:center;">
                                        <p style="margin:0;color:#9e9a90;font-size:12px;">EY Engagement Tracker · Automated notification</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(consultantName, clientName, deadline, status);
    }

    public String buildHighDemandAlertHtml(String consultantName, long count) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background-color:#f3f1eb;font-family:Inter,'Segoe UI',Arial,sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f3f1eb;padding:40px 20px;">
                    <tr>
                        <td align="center">
                            <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                                <tr>
                                    <td style="padding:32px 40px;background:linear-gradient(135deg,#212127 0%,#2a2a32 100%);">
                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <span style="display:inline-block;width:28px;height:28px;background:linear-gradient(135deg,#ffd100 0 72%%,transparent 72%% 100%%);transform:skewX(-18deg);margin-right:10px;vertical-align:middle;"></span>
                                                    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.08em;vertical-align:middle;">EY</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:32px 40px;">
                                        <h1 style="margin:0 0 8px;font-size:24px;color:#1d1d1b;">🔥 High Engagement Demand</h1>
                                        <p style="margin:0 0 20px;color:#6f6a60;font-size:15px;line-height:1.6;">You have been assigned a high number of active engagements.</p>
                                        <table width="100%%" cellpadding="12" cellspacing="0" style="background:#f7f6f2;border-radius:6px;margin-bottom:20px;">
                                            <tr>
                                                <td style="font-weight:700;color:#4b4740;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Consultant</td>
                                                <td style="color:#1d1d1b;font-weight:600;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="font-weight:700;color:#4b4740;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Active Engagements</td>
                                                <td style="color:#b49a00;font-weight:700;font-size:20px;">%d</td>
                                            </tr>
                                        </table>
                                        <p style="margin:0;color:#6f6a60;font-size:14px;line-height:1.6;">Please review your workload and prioritize accordingly.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 40px;border-top:1px solid rgba(18,18,18,0.08);text-align:center;">
                                        <p style="margin:0;color:#9e9a90;font-size:12px;">EY Engagement Tracker · Automated notification</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(consultantName, count);
    }
}
