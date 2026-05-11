import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const passwordResetTranslations = {
  es: {
    subject: "Recupera tu contrasena",
    greeting: "Hola",
    intro: "Usa este enlace para restablecer tu contrasena:",
    expiry: "Este enlace expira en 1 hora.",
  },
  en: {
    subject: "Reset your password",
    greeting: "Hello",
    intro: "Use this link to reset your password:",
    expiry: "This link expires in 1 hour.",
  },
};

const courseInvitationTranslations = {
  es: {
    subject: "Invitacion a curso",
    greeting: "Hola",
    intro: "Has sido invitado(a) al curso:",
    action: "Para activar tu acceso y definir tu contrasena, usa este enlace:",
    expiry: "Este enlace expira en 24 horas.",
  },
  en: {
    subject: "Course invitation",
    greeting: "Hello",
    intro: "You have been invited to the course:",
    action: "To activate your access and set your password, use this link:",
    expiry: "This link expires in 24 hours.",
  },
};

const getPasswordResetCopy = (locale) => {
  const normalizedLocale = String(locale || "es").toLowerCase().startsWith("en") ? "en" : "es";
  return passwordResetTranslations[normalizedLocale];
};

const getCourseInvitationCopy = (locale) => {
  const normalizedLocale = String(locale || "es").toLowerCase().startsWith("en") ? "en" : "es";
  return courseInvitationTranslations[normalizedLocale];
};

const mailConfig = {
  host: process.env.MAILSERVER || process.env.MAILSERVER3,
  port: Number(process.env.MAILPORT || process.env.MAILPORT3 || 465),
  user: process.env.MAILUSER || process.env.MAILUSER3,
  password: process.env.PASSWORD || process.env.PASSWORD3,
};

const createTransporter = () => {
  if (!mailConfig.host || !mailConfig.user || !mailConfig.password) {
    return null;
  }

  return nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.port === 465,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.password,
    },
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl, locale }) => {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn("Mailer is not configured for password reset emails");
    logger.info("Password reset URL", { to, resetUrl });
    return false;
  }

  const copy = getPasswordResetCopy(locale);
  const greetingLine = `${copy.greeting} ${name || ""},`.trim();

  try {
    await transporter.sendMail({
      from: process.env.MAILUSER || process.env.MAILUSER3,
      to,
      subject: copy.subject,
      text: `${greetingLine} ${copy.intro} ${resetUrl} ${copy.expiry}`,
      html: `<p>${greetingLine}</p><p>${copy.intro}</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>${copy.expiry}</p>`,
    });

    return true;
  } catch (error) {
    logger.error("Failed to send password reset email", { error: error.message, to });
    logger.info("Password reset URL", { to, resetUrl });
    return false;
  }
};

export const sendCourseInvitationEmail = async ({ to, name, invitationUrl, courseTitle, locale }) => {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn("Mailer is not configured for course invitation emails");
    logger.info("Course invitation URL", { to, invitationUrl, courseTitle });
    return false;
  }

  const copy = getCourseInvitationCopy(locale);
  const greetingLine = `${copy.greeting} ${name || ""},`.trim();

  try {
    await transporter.sendMail({
      from: process.env.MAILUSER || process.env.MAILUSER3,
      to,
      subject: `${copy.subject}: ${courseTitle}`,
      text: `${greetingLine} ${copy.intro} ${courseTitle}. ${copy.action} ${invitationUrl} ${copy.expiry}`,
      html: `<p>${greetingLine}</p><p>${copy.intro} <strong>${courseTitle}</strong>.</p><p>${copy.action}</p><p><a href="${invitationUrl}">${invitationUrl}</a></p><p>${copy.expiry}</p>`,
    });

    return true;
  } catch (error) {
    logger.error("Failed to send course invitation email", { error: error.message, to, courseTitle });
    logger.info("Course invitation URL", { to, invitationUrl, courseTitle });
    return false;
  }
};