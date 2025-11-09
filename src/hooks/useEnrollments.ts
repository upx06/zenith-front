import { useQuery } from "@apollo/client/react";
import { LIST_ENROLLMENTS } from "../graphql/queries/ListEnrollments";
import type { IListEnrollments } from "../interfaces/IListEnrollments";

export function useEnrollments() {
  const { data, loading, error, refetch } = useQuery<IListEnrollments>(
    LIST_ENROLLMENTS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    enrollments: data?.listEnrollments?.results || [],
    loading,
    error,
    refetch,
  };
}
