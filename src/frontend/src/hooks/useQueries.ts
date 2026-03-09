import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { Answer, MediaItem, Question, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ─── Questions ────────────────────────────────────────────────────────────────

export function useAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useQuestion(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Question>({
    queryKey: ["question", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getQuestion(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAnswersForQuestion(questionId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Answer[]>({
    queryKey: ["answers", questionId?.toString()],
    queryFn: async () => {
      if (!actor || questionId === null) return [];
      return actor.getAnswersForQuestion(questionId);
    },
    enabled: !!actor && !isFetching && questionId !== null,
  });
}

export function useCreateQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      body,
      authorName,
    }: {
      title: string;
      body: string;
      authorName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createQuestion(title, body, authorName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function usePostAnswer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionId,
      body,
      authorName,
    }: {
      questionId: bigint;
      body: string;
      authorName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.postAnswer(questionId, body, authorName);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["answers", vars.questionId.toString()],
      });
    },
  });
}

// ─── Media ────────────────────────────────────────────────────────────────────

export function useAllMediaItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MediaItem[]>({
    queryKey: ["media"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMediaItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMediaItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      file,
      mediaType,
      uploaderName,
      onProgress,
    }: {
      title: string;
      description: string;
      file: File;
      mediaType: string;
      uploaderName: string;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await file.arrayBuffer());
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }
      return actor.createMediaItem(
        title,
        description,
        blob,
        mediaType,
        uploaderName,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

export function useDeleteMediaItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteMediaItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
