import useSWR from "swr";
import { fetcher, getAuthToken } from "@/lib/fetcher";

export function useOrders() {
  const token = getAuthToken();

  const { data, error, isLoading, mutate } = useSWR(token ? "/orders" : null, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const orders = Array.isArray(data) ? data : data?.data || [];

  return {
    orders,
    error,
    isLoading,
    mutate,
  };
}
