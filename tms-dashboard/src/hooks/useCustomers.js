import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useCustomers() {
  const { data, error, isLoading, mutate } = useSWR(
    "http://localhost:4000/customers",
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
