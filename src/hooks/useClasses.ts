import { useQuery } from "@apollo/client/react";
import type { IListClasses } from "../interfaces/IListClasses";
import { LIST_CLASSES } from "../graphql/queries/ListClasses";

export function useClasses() {
  const { data, loading, error, refetch } = useQuery<IListClasses>(
    LIST_CLASSES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  return {
    classes: data?.listClasses?.results || [],
    loading,
    error,
    refetch,
  };
}
