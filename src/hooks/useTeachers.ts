// hooks/useTeachers.ts
import { useQuery } from "@apollo/client/react";
import { LIST_TEACHERS } from "../graphql/queries/ListTeachers";
import type { IListTeachers } from "../interfaces/IListTeachers";

export function useTeachers() {
  const { data, loading, error, refetch } = useQuery<IListTeachers>(
    LIST_TEACHERS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    teachers: data?.listTeachers?.results || [],
    loading,
    error,
    refetch,
  };
}
