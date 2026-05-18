import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { AITutorConversation } from "../models/aiTutorConversation.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Quiz } from "../models/quiz.model.js";
import { getMissingFields, sendError, sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { isValidObjectId } from "../utils/validators.js";

const DEFAULT_SUGGESTED_PROMPTS = [
  "Resumeme este capitulo en 5 puntos.",
  "Explicamelo con un ejemplo practico.",
  "Hazme 3 preguntas para practicar.",
  "Que debo repasar antes del quiz?",
];

const MAX_PERSISTED_MESSAGES = 20;

const ALLOWED_INTERACTION_TYPES = new Set([
  "freeform",
  "summary",
  "example",
  "practice",
  "review",
  "quiz_errors",
  "retry_prep",
  "system",
]);

const normalizeInteractionType = (value) => {
  if (typeof value !== "string") {
    return "freeform";
  }

  return ALLOWED_INTERACTION_TYPES.has(value) ? value : "freeform";
};

const clampConversation = (conversation = []) => {
  if (!Array.isArray(conversation)) {
    return [];
  }

  return conversation
    .filter(
      (entry) =>
        entry &&
        typeof entry.role === "string" &&
        typeof entry.content === "string" &&
        entry.content.trim()
    )
    .slice(-6)
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      interactionType: normalizeInteractionType(entry.interactionType),
      content: entry.content.trim().slice(0, 1500),
    }));
};

const getConversationHistory = async ({ userId, courseId, lectureId }) => {
  return AITutorConversation.findOne({ userId, courseId, lectureId }).select("messages lastActivityAt");
};

const saveConversationHistory = async ({ userId, courseId, lectureId, messages }) => {
  const normalizedMessages = clampConversation(messages).slice(-MAX_PERSISTED_MESSAGES);

  await AITutorConversation.findOneAndUpdate(
    { userId, courseId, lectureId },
    {
      $set: {
        messages: normalizedMessages,
        lastActivityAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

const summarizeSupportMaterials = (materials = []) => {
  if (!materials.length) {
    return "No hay materiales de apoyo adicionales.";
  }

  return materials
    .map((material, index) => `${index + 1}. ${material.name}`)
    .join("\n");
};

const summarizeQuiz = (quiz) => {
  if (!quiz?.questions?.length) {
    return "No hay quiz configurado para esta leccion.";
  }

  return quiz.questions
    .slice(0, 5)
    .map((question, index) => {
      const explanation = question.explanation ? ` Explicacion: ${question.explanation}` : "";
      return `${index + 1}. ${question.question}${explanation}`;
    })
    .join("\n");
};

const buildFallbackAnswer = ({ question, lecture, quiz, lectureProgress, progress }) => {
  const normalizedQuestion = question.toLowerCase();
  const completionStatus = lectureProgress?.quizCompleted
    ? "Ya aprobaste el quiz de esta leccion."
    : lectureProgress?.watched
      ? "Ya viste el video y el siguiente paso es rendir el quiz."
      : "Tu siguiente paso es terminar el video antes de rendir el quiz.";

  if (normalizedQuestion.includes("resumen") || normalizedQuestion.includes("resume")) {
    return [
      `Resumen del capitulo \"${lecture.lectureTitle}\":`,
      lecture.lectureDescription || "Este capitulo no tiene descripcion cargada, asi que conviene revisar el video y el material de apoyo.",
      completionStatus,
      `Progreso actual en el curso: ${progress?.courseProgress || 0}%.`,
    ].join("\n\n");
  }

  if (normalizedQuestion.includes("pract") || normalizedQuestion.includes("pregunta") || normalizedQuestion.includes("quiz")) {
    const practiceQuestions = quiz?.questions?.slice(0, 3).map((item, index) => `${index + 1}. ${item.question}`) || [];
    if (practiceQuestions.length > 0) {
      return [
        "Aqui tienes preguntas para practicar antes del quiz:",
        practiceQuestions.join("\n"),
        "Intenta responderlas sin mirar el material y luego compara con la explicacion del quiz.",
      ].join("\n\n");
    }

    return [
      "Este capitulo todavia no tiene preguntas configuradas.",
      "Te recomiendo anotar 3 ideas clave del video, 2 conceptos que conecten con casos reales y 1 duda que quieras aclarar.",
    ].join("\n\n");
  }

  if (normalizedQuestion.includes("repasar") || normalizedQuestion.includes("mejorar") || normalizedQuestion.includes("fall")) {
    const explanation = quiz?.questions?.find((item) => item.explanation)?.explanation;
    return [
      "Antes del quiz, enfocate en estos puntos:",
      `1. ${lecture.lectureDescription || "Repasa los conceptos centrales explicados en el video."}`,
      `2. ${explanation || "Verifica definiciones, pasos y casos de uso principales del capitulo."}`,
      `3. ${completionStatus}`,
    ].join("\n");
  }

  return [
    `Estoy usando el contexto del curso para ayudarte con \"${lecture.lectureTitle}\".`,
    lecture.lectureDescription || "No hay descripcion cargada para esta leccion, asi que basate en el video y materiales de apoyo.",
    completionStatus,
    quiz?.questions?.length
      ? `El quiz asociado tiene ${quiz.questions.length} preguntas y exige ${quiz.passingScore || 70}% para aprobar.`
      : "Esta leccion no tiene quiz configurado todavia.",
    "Si quieres, puedo resumir el capitulo, darte preguntas de practica o decirte que repasar antes del quiz.",
  ].join("\n\n");
};

const buildSystemPrompt = ({ course, lecture, quiz, progress, lectureProgress }) => {
  return [
    "Eres un tutor de aprendizaje dentro de un LMS.",
    "Responde en espanol claro, concreto y util.",
    "No inventes contenido fuera del contexto dado. Si falta informacion, dilo y redirige al alumno al material disponible.",
    "Prioriza explicaciones practicas, pasos accionables y apoyo para aprobar el quiz.",
    `Curso: ${course.courseTitle}`,
    `Descripcion del curso: ${course.subTitle || course.description || "No disponible"}`,
    `Leccion actual: ${lecture.lectureTitle}`,
    `Descripcion de la leccion: ${lecture.lectureDescription || "No disponible"}`,
    `Material de apoyo:\n${summarizeSupportMaterials(lecture.supportMaterials)}`,
    `Estado del alumno en esta leccion: visto=${Boolean(lectureProgress?.watched)}, quizAprobado=${Boolean(lectureProgress?.quizCompleted)}, intentosQuiz=${lectureProgress?.quizAttempts || 0}`,
    `Progreso general del curso: ${progress?.courseProgress || 0}%, quizzes aprobados=${progress?.completedQuizzes || 0}/${progress?.totalQuizzes || 0}, promedio=${progress?.averageQuizScore || 0}%`,
    `Resumen del quiz:\n${summarizeQuiz(quiz)}`,
  ].join("\n");
};

const callOpenAICompatibleApi = async ({ systemPrompt, conversation, question }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        ...conversation,
        { role: "user", content: question },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI-compatible request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
};

export const chatWithTutor = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId, question, conversation, interactionType } = req.body;
    const userId = req.id;

    const missingFields = getMissingFields({ courseId, lectureId, question });
    if (missingFields.length > 0) {
      return sendError(res, {
        status: 400,
        message: "courseId, lectureId and question are required",
        errors: missingFields,
      });
    }

    if (!isValidObjectId(courseId) || !isValidObjectId(lectureId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course or lecture id",
        errors: ["courseId and lectureId must be valid ids"],
      });
    }

    const trimmedQuestion = String(question).trim();
    const normalizedInteractionType = normalizeInteractionType(interactionType);
    if (!trimmedQuestion) {
      return sendError(res, {
        status: 400,
        message: "question is required",
        errors: ["question must not be empty"],
      });
    }

    const [course, lecture, quiz, progress] = await Promise.all([
      Course.findById(courseId).select("courseTitle subTitle description creator lectures"),
      Lecture.findById(lectureId).select("lectureTitle lectureDescription supportMaterials"),
      Quiz.findOne({ courseId, lectureId, isActive: true }).select("title description passingScore questions"),
      CourseProgress.findOne({ userId, courseId }).select("courseProgress completedQuizzes totalQuizzes averageQuizScore lectures"),
    ]);

    if (!course || !lecture) {
      return sendError(res, {
        status: 404,
        message: "Course or lecture not found",
      });
    }

    const lectureBelongsToCourse = (course.lectures || []).some(
      (entry) => String(entry) === String(lectureId)
    );

    if (!lectureBelongsToCourse) {
      return sendError(res, {
        status: 400,
        message: "Lecture does not belong to course",
      });
    }

    const lectureProgress = progress?.lectures?.find(
      (entry) => String(entry.lectureId) === String(lectureId)
    );
    const safeConversation = clampConversation(conversation);
    const systemPrompt = buildSystemPrompt({
      course,
      lecture,
      quiz,
      progress,
      lectureProgress,
    });

    let answer = null;
    let provider = "fallback";

    try {
      answer = await callOpenAICompatibleApi({
        systemPrompt,
        conversation: safeConversation,
        question: trimmedQuestion,
      });
      if (answer) {
        provider = "openai-compatible";
      }
    } catch (providerError) {
      logger.warn("AI tutor provider unavailable, using fallback response", {
        error: providerError.message,
        courseId,
        lectureId,
        userId,
      });
    }

    if (!answer) {
      answer = buildFallbackAnswer({
        question: trimmedQuestion,
        lecture,
        quiz,
        lectureProgress,
        progress,
      });
    }

    const persistedMessages = [
      ...safeConversation,
      { role: "user", interactionType: normalizedInteractionType, content: trimmedQuestion },
      { role: "assistant", interactionType: normalizedInteractionType, content: answer },
    ]
      .slice(-MAX_PERSISTED_MESSAGES);

    await saveConversationHistory({
      userId,
      courseId,
      lectureId,
      messages: persistedMessages,
    });

    return sendSuccess(res, {
      answer,
      provider,
      suggestedPrompts: DEFAULT_SUGGESTED_PROMPTS,
      context: {
        courseTitle: course.courseTitle,
        lectureTitle: lecture.lectureTitle,
        progress: progress?.courseProgress || 0,
        quizAvailable: Boolean(quiz),
      },
    });
  } catch (error) {
    logger.error("Error chatting with AI tutor", {
      error: error.message,
      courseId: req.params.courseId,
      lectureId: req.body?.lectureId,
      userId: req.id,
    });
    return sendError(res, {
      status: 500,
      message: "Error generating tutor response",
    });
  }
};

export const getTutorHistory = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    if (!isValidObjectId(courseId) || !isValidObjectId(lectureId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course or lecture id",
        errors: ["courseId and lectureId must be valid ids"],
      });
    }

    const history = await getConversationHistory({ userId, courseId, lectureId });

    return sendSuccess(res, {
      messages: history?.messages || [],
      suggestedPrompts: DEFAULT_SUGGESTED_PROMPTS,
      lastActivityAt: history?.lastActivityAt || null,
    });
  } catch (error) {
    logger.error("Error fetching AI tutor history", {
      error: error.message,
      courseId: req.params.courseId,
      lectureId: req.params.lectureId,
      userId: req.id,
    });
    return sendError(res, {
      status: 500,
      message: "Error loading tutor history",
    });
  }
};

export const clearTutorHistory = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    if (!isValidObjectId(courseId) || !isValidObjectId(lectureId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course or lecture id",
        errors: ["courseId and lectureId must be valid ids"],
      });
    }

    await AITutorConversation.findOneAndDelete({ userId, courseId, lectureId });

    return sendSuccess(res, {
      message: "Tutor history cleared",
    });
  } catch (error) {
    logger.error("Error clearing AI tutor history", {
      error: error.message,
      courseId: req.params.courseId,
      lectureId: req.params.lectureId,
      userId: req.id,
    });
    return sendError(res, {
      status: 500,
      message: "Error clearing tutor history",
    });
  }
};