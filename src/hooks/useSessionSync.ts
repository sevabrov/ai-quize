/**
 * Синхронізація сесії з json-server через TanStack Query.
 *
 * Правила:
 *  • сесія створюється ліниво - на першій реальній відповіді, а не на кліку «Почати»;
 *  • будь-яка помилка API лише логується, UI продовжує працювати;
 *  • json-server сам генерує id при POST, тому для PATCH використовується
 *    саме серверний id (зберігається окремо від нашого clientId);
 *  • якщо створення провалилося - наступна відповідь спробує ще раз.
 */

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, newSessionId, type QuizSession } from "../lib/api";
import {
  readRemoteId,
  readSessionId,
  writeRemoteId,
  writeSessionId,
} from "../lib/storage";

type SyncState = "idle" | "saving" | "saved" | "offline";

export function useSessionSync() {
  const [remoteId, setRemoteId] = useState<string | null>(() => readRemoteId());
  const [syncState, setSyncState] = useState<SyncState>("idle");

  const clientIdRef = useRef<string | null>(readSessionId());
  const remoteIdRef = useRef<string | null>(remoteId);
  const creatingRef = useRef<Promise<string> | null>(null);

  /** Читання записаної сесії - індикатор «збережено» та резервне відновлення. */
  const sessionQuery = useQuery<QuizSession>({
    queryKey: ["session", remoteId],
    queryFn: () => api.getSession(remoteId!),
    enabled: Boolean(remoteId),
    retry: 0,
    notifyOnChangeProps: ["data"],
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<QuizSession> }) =>
      api.patchSession(id, patch),
    onSuccess: () => setSyncState("saved"),
    onError: (error) => {
      setSyncState("offline");
      console.warn("[quiz] не вдалося зберегти відповідь:", error);
    },
  });

  const leadMutation = useMutation({
    mutationFn: (payload: Parameters<typeof api.createLead>[0]) =>
      api.createLead(payload),
    onError: (error) => console.warn("[quiz] лід не збережено:", error),
  });

  const bookingMutation = useMutation({
    mutationFn: (payload: Parameters<typeof api.createBooking>[0]) =>
      api.createBooking(payload),
    onError: (error) => console.warn("[quiz] бронювання не збережено:", error),
  });

  /** Гарантує наявність записи на сервері й повертає серверний id. */
  const ensureSession = useCallback(async (): Promise<string> => {
    if (remoteIdRef.current) return remoteIdRef.current;

    if (!clientIdRef.current) {
      const id = newSessionId();
      clientIdRef.current = id;
      writeSessionId(id);
    }
    const clientId = clientIdRef.current;

    creatingRef.current ??= api
      .createSession(clientId)
      .then((record) => {
        remoteIdRef.current = record.id;
        writeRemoteId(record.id);
        setRemoteId(record.id);
        setSyncState("saved");
        return record.id;
      })
      .catch((error: unknown) => {
        // Дозволяємо повторну спробу на наступній відповіді
        creatingRef.current = null;
        setSyncState("offline");
        console.warn("[quiz] json-server недоступний, працюю локально:", error);
        throw error;
      });

    return creatingRef.current;
  }, []);

  /** Fire-and-forget запис. Ніколи не кидає нагору. */
  const push = useCallback(
    (patch: Partial<QuizSession>) => {
      setSyncState("saving");
      void ensureSession()
        .then((id) => patchMutation.mutate({ id, patch }))
        .catch(() => setSyncState("offline"));
    },
    [ensureSession, patchMutation],
  );

  const saveLead = useCallback(
    (payload: Omit<Parameters<typeof api.createLead>[0], "sessionId">) => {
      void ensureSession()
        .then((id) => leadMutation.mutate({ ...payload, sessionId: id }))
        .catch(() => undefined);
    },
    [ensureSession, leadMutation],
  );

  const saveBooking = useCallback(
    (payload: Omit<Parameters<typeof api.createBooking>[0], "sessionId">) => {
      void ensureSession()
        .then((id) => bookingMutation.mutate({ ...payload, sessionId: id }))
        .catch(() => undefined);
    },
    [ensureSession, bookingMutation],
  );

  return {
    sessionId: remoteId,
    syncState,
    /** Сесія, прочитана з сервера (для відновлення / діагностики) */
    remoteSession: sessionQuery.data ?? null,
    ensureSession,
    push,
    saveLead,
    saveBooking,
  };
}

export type SessionSync = ReturnType<typeof useSessionSync>;
