import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR(
    "/customers",
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  return {
    customers: data || [],
    error,
    isLoading,
    mutate,
  };
}
