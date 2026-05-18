import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  useChatWithTutorMutation,
  useClearTutorHistoryMutation,
  useGetTutorHistoryQuery,
} from "@/features/api/aiTutorApi";
import { Bot, LoaderCircle, RotateCcw, SendHorizontal, Sparkles } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DEFAULT_PROMPTS = [
  { label: "Resumeme este capitulo en 5 puntos.", interactionType: "summary" },
  { label: "Explicamelo con un ejemplo practico.", interactionType: "example" },
  { label: "Hazme 3 preguntas para practicar.", interactionType: "practice" },
  { label: "Que debo repasar antes del quiz?", interactionType: "review" },
];

const createWelcomeMessage = (lecture) => ({
  role: "assistant",
  content: lecture?.lectureTitle
    ? `Soy tu tutor del capitulo \"${lecture.lectureTitle}\". Puedo resumirlo, darte preguntas de practica o ayudarte a preparar el quiz.`
    : "Selecciona un capitulo para activar el tutor.",
});

const AITutorPanel = ({ courseId, lecture, lectureProgress, quiz, pendingPrompt }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => [createWelcomeMessage(lecture)]);
  const [suggestedPrompts, setSuggestedPrompts] = useState(DEFAULT_PROMPTS);
  const [lastProvider, setLastProvider] = useState("fallback");
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [chatWithTutor, { isLoading }] = useChatWithTutorMutation();
  const [clearTutorHistory, { isLoading: isClearing }] = useClearTutorHistoryMutation();
  const { data: historyData, isFetching: historyLoading } = useGetTutorHistoryQuery(
    { courseId, lectureId: lecture?._id },
    { skip: !courseId || !lecture?._id }
  );

  useEffect(() => {
    setMessages([createWelcomeMessage(lecture)]);
    setSuggestedPrompts(DEFAULT_PROMPTS);
    setQuestion("");
    setIsBootstrapping(Boolean(lecture?._id));
  }, [lecture?._id]);

  useEffect(() => {
    if (!lecture?._id) {
      return;
    }

    if (historyLoading) {
      return;
    }

    const historyMessages = historyData?.messages || [];
    setMessages(historyMessages.length ? historyMessages : [createWelcomeMessage(lecture)]);
    setSuggestedPrompts(historyData?.suggestedPrompts?.length ? historyData.suggestedPrompts : DEFAULT_PROMPTS);
    setIsBootstrapping(false);
  }, [historyData, historyLoading, lecture]);

  const conversation = useMemo(() => {
    return messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-6)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
  }, [messages]);

  const sendMessage = async (messageInput) => {
    const interactionType = typeof messageInput === "object" && messageInput !== null
      ? messageInput.interactionType || "freeform"
      : "freeform";
    const rawContent = typeof messageInput === "object" && messageInput !== null
      ? messageInput.content || messageInput.label || ""
      : messageInput;
    const trimmedMessage = String(rawContent || "").trim();
    if (!trimmedMessage || !courseId || !lecture?._id) {
      return;
    }

    const nextUserMessage = { role: "user", interactionType, content: trimmedMessage };
    const nextConversation = [...conversation, nextUserMessage];

    setMessages((current) => [...current, nextUserMessage]);
    setQuestion("");

    try {
      const response = await chatWithTutor({
        courseId,
        lectureId: lecture._id,
        question: trimmedMessage,
        conversation: nextConversation,
        interactionType,
      }).unwrap();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          interactionType,
          content: response.answer,
        },
      ]);
      setSuggestedPrompts(response.suggestedPrompts?.length ? response.suggestedPrompts : DEFAULT_PROMPTS);
      setLastProvider(response.provider || "fallback");
    } catch (error) {
      toast.error(error?.data?.message || "No se pudo obtener respuesta del tutor.");
      setMessages((current) => current.slice(0, -1));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(question);
  };

  useEffect(() => {
    if (!pendingPrompt?.id || !pendingPrompt?.prompt || !lecture?._id) {
      return;
    }

    void sendMessage(pendingPrompt);
  }, [pendingPrompt, lecture?._id]);

  const handleResetConversation = async () => {
    if (!courseId || !lecture?._id) {
      return;
    }

    try {
      await clearTutorHistory({ courseId, lectureId: lecture._id }).unwrap();
      setMessages([createWelcomeMessage(lecture)]);
      setSuggestedPrompts(DEFAULT_PROMPTS);
      setQuestion("");
      toast.success("La conversacion del tutor se reinicio para este capitulo.");
    } catch (error) {
      toast.error(error?.data?.message || "No se pudo reiniciar la conversacion.");
    }
  };

  return (
    <Card className="border-slate-200/80 bg-white/90 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Tutor IA
            </p>
            <CardTitle className="mt-2 flex items-center gap-2 text-xl text-slate-900">
              <Sparkles className="h-5 w-5 text-sky-600" />
              Asistencia contextual
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-sky-200 text-sky-700">
              {lastProvider === "openai-compatible" ? "IA conectada" : "Modo guiado"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-600"
              onClick={handleResetConversation}
              disabled={!lecture?._id || historyLoading || isLoading || isClearing}
            >
              {isClearing ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Reiniciar
            </Button>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          {lecture?.lectureTitle
            ? `Usa el contexto del capitulo activo para resolver dudas, practicar antes del quiz y repasar lo importante.`
            : "Selecciona un capitulo para empezar a conversar con el tutor."}
        </p>
        {lecture && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium text-slate-900">{lecture.lectureTitle}</p>
            <p className="mt-1">
              {lectureProgress?.quizCompleted
                ? "Ya aprobaste este quiz. Puedes pedir repaso o un caso practico."
                : lectureProgress?.watched
                  ? `Ya viste el video. El quiz exige ${quiz?.passingScore || 70}% para aprobar.`
                  : "Termina el video y usa el tutor para preparar el quiz antes de rendirlo."}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";

            return (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                  isAssistant
                    ? "border-slate-200 bg-slate-50 text-slate-700"
                    : "border-sky-200 bg-sky-50 text-slate-800"
                }`}
              >
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {isAssistant ? <Bot className="h-4 w-4" /> : <SendHorizontal className="h-4 w-4" />}
                  {isAssistant ? "Tutor" : "Tu mensaje"}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            );
          })}
          {(isBootstrapping || historyLoading || isLoading || isClearing) && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {isClearing
                  ? "Reiniciando la conversacion del tutor..."
                  : isLoading
                    ? "Pensando una respuesta con el contexto del curso..."
                    : "Cargando historial del tutor..."}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <Button
              key={typeof prompt === "string" ? prompt : prompt.label}
              type="button"
              variant="outline"
              className="h-auto whitespace-normal rounded-full px-3 py-2 text-left text-xs text-slate-600"
              onClick={() => sendMessage(prompt)}
              disabled={isLoading || historyLoading || isClearing || !lecture?._id}
            >
              {typeof prompt === "string" ? prompt : prompt.label}
            </Button>
          ))}
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Pregunta algo sobre esta leccion, pide un resumen o solicita preguntas para practicar."
            className="min-h-24 resize-none border-slate-200"
            disabled={!lecture?._id || isLoading || historyLoading || isClearing}
          />
          <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={!question.trim() || !lecture?._id || isLoading || historyLoading || isClearing}>
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Consultando tutor
              </>
            ) : (
              <>
                <SendHorizontal className="mr-2 h-4 w-4" />
                Enviar pregunta
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AITutorPanel;