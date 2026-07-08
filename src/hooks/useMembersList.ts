import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { membersService } from "@/services/api/membersService";
import type { GetMembersParams, Member } from "@/types/member";

interface UseMembersListResult {
  members: Member[];
  totalPages: number;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useMembersList(params: GetMembersParams): UseMembersListResult {
  const [members, setMembers] = useState<Member[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const hasLoadedOnceRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadMembers = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++requestIdRef.current;
      const isSubsequentLoad = hasLoadedOnceRef.current;

      if (isSubsequentLoad) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);

      try {
        const response = await membersService.getMembers(params, signal);

        if (requestId !== requestIdRef.current) return;

        setMembers(response.data);
        setTotalPages(Math.max(response.meta.totalPages || 1, 1));
        hasLoadedOnceRef.current = true;
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        if (axios.isCancel(error)) return;
        setError(error);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [params.limit, params.page, params.search]
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadMembers(controller.signal);

    return () => {
      controller.abort();
      requestIdRef.current += 1;
    };
  }, [loadMembers]);

  const refetch = useCallback(async () => {
    await loadMembers();
  }, [loadMembers]);

  return {
    members,
    totalPages,
    isInitialLoading,
    isRefreshing,
    error,
    refetch
  };
}
