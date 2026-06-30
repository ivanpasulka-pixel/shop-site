require("dotenv").config();

const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const STORE_NAME = "SKIPLE|STORE";
const TELEGRAM_URL = "https://t.me/NeverYork2";
const MONO_JAR_URL = "https://send.monobank.ua/jar/3gUg3tUjvs";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePhone(phone = "") {
  return String(phone).replace(/\s+/g, " ").trim();
}

function validateOrder(body = {}) {
  const name = String(body.name || "").trim();
  const phone = normalizePhone(body.phone || "");
  const city = String(body.city || "").trim();
  const post = String(body.post || "").trim();
  const comment = String(body.comment || "").trim();
  const paymentMethod = String(body.paymentMethod || "Наложенный платеж").trim();
  const items = String(body.items || "").trim();
  const total = Number(body.total || 0);

  if (!name || !phone || !city || !post) {
    return { ok: false, reason: "invalid-data" };
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return { ok: false, reason: "invalid-phone" };
  }

  if (!items || total <= 0) {
    return { ok: false, reason: "invalid-cart" };
  }

  return {
    ok: true,
    data: { name, phone, city, post, comment, paymentMethod, items, total }
  };
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
}

app.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok" });
});

app.post("/send-order", async (req, res) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("EMAIL_USER / EMAIL_PASS are missing");
    return res.status(500).json({ success: false, reason: "no-credentials" });
  }

  const validation = validateOrder(req.body);
  if (!validation.ok) {
    return res.status(400).json({ success: false, reason: validation.reason });
  }

  const { name, phone, city, post, comment, paymentMethod, items, total } = validation.data;

  const textMessage = [
    "НОВЫЙ ЗАКАЗ",
    "",
    items,
    `Итого: ${total} грн`,
    `Метод оплаты: ${paymentMethod}`,
    "",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Город: ${city}`,
    `НП: ${post}`,
    `Комментарий: ${comment || "нет"}`
  ].join("\n");

  const itemsHtml = escapeHtml(items).replace(/\n/g, "<br>");

  const htmlMessage = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:680px;margin:0 auto;padding:24px;background:#ffffff;">
      <h1 style="margin:0 0 18px;font-size:26px;">Новый заказ — ${STORE_NAME}</h1>
      <div style="background:#f6f6f6;border-radius:16px;padding:18px;margin-bottom:18px;">
        <p style="margin:0 0 8px;"><strong>Имя:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 8px;"><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
        <p style="margin:0 0 8px;"><strong>Город:</strong> ${escapeHtml(city)}</p>
        <p style="margin:0 0 8px;"><strong>Отделение Новой Почты:</strong> ${escapeHtml(post)}</p>
        <p style="margin:0 0 8px;"><strong>Оплата:</strong> ${escapeHtml(paymentMethod)}</p>
        <p style="margin:0;"><strong>Комментарий:</strong> ${escapeHtml(comment || "нет")}</p>
      </div>
      <div style="background:#111;color:#fff;border-radius:16px;padding:18px;margin-bottom:18px;">
        <p style="margin:0 0 10px;font-size:18px;"><strong>Состав заказа</strong></p>
        <div style="margin:0 0 10px;white-space:normal;">${itemsHtml}</div>
        <p style="margin:0;font-size:18px;"><strong>Итого: ${total} грн</strong></p>
      </div>
      <p style="margin:0;color:#666;font-size:13px;">Это письмо отправлено автоматически с сайта ${STORE_NAME}.</p>
    </div>
  `;

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"${STORE_NAME}" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: `Новый заказ — ${name}`,
      text: textMessage,
      html: htmlMessage,
      replyTo: EMAIL_USER
    });

    console.log("Order email sent successfully");
    return res.json({ success: true });
  } catch (error) {
    console.error("Mail send error:", error);
    return res.status(500).json({ success: false, reason: "email-error" });
  }
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`${STORE_NAME} server is running on port ${PORT}`);
  console.log(`Telegram: ${TELEGRAM_URL}`);
  console.log(`Monobank jar: ${MONO_JAR_URL}`);
});
