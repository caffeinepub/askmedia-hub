import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronRight,
  Loader2,
  MessageSquare,
  Plus,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllQuestions,
  useCallerUserProfile,
  useCreateQuestion,
} from "../hooks/useQueries";

const SAMPLE_QUESTIONS = [
  {
    id: BigInt(-1),
    title: "How do I solve quadratic equations step-by-step?",
    body: "I'm struggling with algebra homework and can't figure out how to factor or use the quadratic formula correctly. Can someone walk me through it with an example like 2x² + 5x - 3 = 0?",
    authorName: "MathNewbie",
  },
  {
    id: BigInt(-2),
    title: "What's the best way to learn web development in 2026?",
    body: "I want to switch careers and become a frontend developer. Should I start with vanilla HTML/CSS/JS or jump straight into React? Looking for a realistic roadmap.",
    authorName: "CareerSwitcher",
  },
  {
    id: BigInt(-3),
    title: "Can you explain how black holes form?",
    body: "I watched a documentary about space and I'm fascinated by black holes. How exactly does a star become a black hole and what happens at the event horizon?",
    authorName: "CosmosExplorer",
  },
];

export default function QAPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: profile } = useCallerUserProfile();

  const { data: questions, isLoading, isError } = useAllQuestions();
  const createQuestion = useCreateQuestion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const displayQuestions =
    questions && questions.length > 0 ? questions : SAMPLE_QUESTIONS;
  const isSample = !questions || questions.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const authorName = profile?.name || "Anonymous";
    try {
      await createQuestion.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        authorName,
      });
      toast.success("Question posted!");
      setTitle("");
      setBody("");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to post question. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-10 shadow-card">
        <img
          src="/assets/generated/hero-bg.dim_1600x400.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 px-8 py-12 bg-gradient-to-r from-background/90 via-background/60 to-transparent">
          <Badge
            variant="outline"
            className="mb-3 text-teal border-teal/30 bg-teal/10 font-medium"
          >
            Community Q&amp;A
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
            Ask Anything.
            <br />
            <span className="text-teal">Get Real Answers.</span>
          </h1>
          <p className="text-muted-foreground max-w-md text-base mb-6">
            A community-powered knowledge hub for every kind of question —
            science, math, tech, and beyond.
          </p>
          {isLoggedIn ? (
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-teal hover:bg-teal/90 text-primary-foreground font-semibold shadow-teal"
              data-ocid="qa.ask_button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ask a Question
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Log in to ask a question
            </p>
          )}
        </div>
      </div>

      {/* Questions List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {isSample
              ? "Recent Questions"
              : `${displayQuestions.length} Question${displayQuestions.length !== 1 ? "s" : ""}`}
          </h2>
          {isLoggedIn && !isSample && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="border-teal/30 text-teal hover:bg-teal/10"
              data-ocid="qa.ask_button"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Ask
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="qa.loading_state">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            className="flex items-center gap-3 rounded-xl p-6 bg-destructive/10 border border-destructive/30 text-destructive"
            data-ocid="qa.error_state"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              Failed to load questions. Please refresh the page.
            </p>
          </div>
        ) : displayQuestions.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-16 text-center glass-card rounded-xl"
            data-ocid="qa.empty_state"
          >
            <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-teal" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                No questions yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to ask something!
              </p>
            </div>
            {isLoggedIn && (
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-teal hover:bg-teal/90 text-primary-foreground mt-2"
                data-ocid="qa.ask_button"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ask a Question
              </Button>
            )}
          </div>
        ) : (
          <motion.ul
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            data-ocid="qa.question_list"
          >
            {displayQuestions.map((q, idx) => (
              <motion.li
                key={q.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
                data-ocid={`qa.question.item.${idx + 1}`}
              >
                {isSample ? (
                  <div className="glass-card rounded-xl p-5 cursor-not-allowed opacity-70">
                    <QuestionCardContent question={q} />
                  </div>
                ) : (
                  <Link
                    to="/question/$id"
                    params={{ id: q.id.toString() }}
                    className="block glass-card rounded-xl p-5 hover:border-teal/40 hover:shadow-teal transition-all group"
                  >
                    <QuestionCardContent question={q} />
                  </Link>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>

      {/* Ask Question Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-lg bg-card border-border shadow-card">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold">
                  Ask a Question
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Be specific and clear. Good questions get great answers.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="q-title">Title</Label>
                  <Input
                    id="q-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your question in one sentence?"
                    maxLength={200}
                    className="bg-muted/30"
                    data-ocid="ask_question.title_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-body">Details</Label>
                  <Textarea
                    id="q-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Provide context, what you've tried, what you expect…"
                    rows={5}
                    maxLength={5000}
                    className="bg-muted/30 resize-none"
                    data-ocid="ask_question.textarea"
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !title.trim() || !body.trim() || createQuestion.isPending
                    }
                    className="bg-teal hover:bg-teal/90 text-primary-foreground"
                    data-ocid="ask_question.submit_button"
                  >
                    {createQuestion.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Posting…
                      </>
                    ) : (
                      "Post Question"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionCardContent({
  question,
}: { question: (typeof SAMPLE_QUESTIONS)[0] }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-base text-foreground group-hover:text-teal transition-colors line-clamp-2 mb-2">
          {question.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {question.body}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>{question.authorName}</span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal transition-colors shrink-0 mt-1" />
    </div>
  );
}
