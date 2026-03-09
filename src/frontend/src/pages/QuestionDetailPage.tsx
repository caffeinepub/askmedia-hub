import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAnswersForQuestion,
  useCallerUserProfile,
  usePostAnswer,
  useQuestion,
} from "../hooks/useQueries";

export default function QuestionDetailPage() {
  const { id } = useParams({ from: "/question/$id" });
  const questionId = BigInt(id);

  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: profile } = useCallerUserProfile();

  const {
    data: question,
    isLoading: questionLoading,
    isError: questionError,
  } = useQuestion(questionId);
  const { data: answers, isLoading: answersLoading } =
    useAnswersForQuestion(questionId);
  const postAnswer = usePostAnswer();

  const [answerBody, setAnswerBody] = useState("");

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerBody.trim()) return;
    const authorName = profile?.name || "Anonymous";
    try {
      await postAnswer.mutateAsync({
        questionId,
        body: answerBody.trim(),
        authorName,
      });
      toast.success("Answer posted!");
      setAnswerBody("");
    } catch {
      toast.error("Failed to post answer. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal transition-colors mb-6 group"
        data-ocid="question_detail.back_button"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Questions
      </Link>

      {/* Question */}
      {questionLoading ? (
        <div
          className="glass-card rounded-2xl p-8 space-y-4"
          data-ocid="question_detail.loading_state"
        >
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : questionError || !question ? (
        <div
          className="flex items-center gap-3 rounded-xl p-6 bg-destructive/10 border border-destructive/30 text-destructive"
          data-ocid="question_detail.error_state"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Question not found or failed to load.</p>
        </div>
      ) : (
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card rounded-2xl p-8 mb-8 shadow-card"
        >
          <Badge
            variant="outline"
            className="text-teal border-teal/30 bg-teal/10 mb-4 text-xs font-medium"
          >
            Question
          </Badge>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">
            {question.title}
          </h1>
          <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap mb-6">
            {question.body}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-4">
            <User className="w-4 h-4" />
            <span>
              Asked by{" "}
              <strong className="text-foreground font-medium">
                {question.authorName}
              </strong>
            </span>
          </div>
        </motion.article>
      )}

      {/* Answers */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <MessageCircle className="w-5 h-5 text-teal" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            {answersLoading
              ? "Answers"
              : `${answers?.length ?? 0} Answer${(answers?.length ?? 0) !== 1 ? "s" : ""}`}
          </h2>
        </div>

        {answersLoading ? (
          <div className="space-y-4" data-ocid="question_detail.loading_state">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : !answers || answers.length === 0 ? (
          <div
            className="glass-card rounded-xl p-8 text-center"
            data-ocid="question_detail.answer_list"
          >
            <p className="text-muted-foreground text-sm">
              No answers yet.{" "}
              {isLoggedIn
                ? "Be the first to answer!"
                : "Log in to post an answer."}
            </p>
          </div>
        ) : (
          <motion.ul
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            data-ocid="question_detail.answer_list"
          >
            {answers.map((answer, idx) => (
              <motion.li
                key={`${answer.authorName}-${idx}`}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                className="glass-card rounded-xl p-5 border-l-2 border-teal/40"
                data-ocid={`question_detail.answer.item.${idx + 1}`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {answer.body}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{answer.authorName}</span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>

      {/* Post Answer */}
      {isLoggedIn ? (
        <section className="glass-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-teal" />
            Post Your Answer
          </h3>
          <form onSubmit={handlePostAnswer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="answer-body" className="sr-only">
                Your answer
              </Label>
              <Textarea
                id="answer-body"
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Share your knowledge or solution…"
                rows={5}
                maxLength={5000}
                className="bg-muted/30 resize-none"
                data-ocid="post_answer.textarea"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!answerBody.trim() || postAnswer.isPending}
                className="bg-teal hover:bg-teal/90 text-primary-foreground font-medium"
                data-ocid="post_answer.submit_button"
              >
                {postAnswer.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Posting…
                  </>
                ) : (
                  "Post Answer"
                )}
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <div className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground border-dashed border-2 border-border">
          <Link to="/" className="text-teal hover:underline font-medium">
            Log in
          </Link>{" "}
          to post an answer
        </div>
      )}
    </div>
  );
}
