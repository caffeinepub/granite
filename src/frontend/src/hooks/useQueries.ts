import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DrawingMetadata, Profile } from "../backend.d";
import { useActor } from "./useActor";

export function useGetProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyDrawings() {
  const { actor, isFetching } = useActor();
  return useQuery<DrawingMetadata[]>({
    queryKey: ["drawings"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getMyDrawings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error("No actor");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useSaveDrawing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (metadata: DrawingMetadata) => {
      if (!actor) throw new Error("No actor");
      await actor.saveDrawing(metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drawings"] });
    },
  });
}

export function useDeleteDrawing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drawingId: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteDrawing(drawingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drawings"] });
    },
  });
}
