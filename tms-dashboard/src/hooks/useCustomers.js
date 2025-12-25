import useSWR from "swr";
import { fetcher, getAuthToken } from "@/lib/fetcher";

export function useCustomers() {
  const token = getAuthToken();
  const { data, error, isLoading, mutate } = useSWR(
    token ? "/clients" : null,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const list = Array.isArray(data) ? data : data?.data || [];
  const customers = list.map((c) => ({
    _id: c._id,
    id: c._id,
    name: c.clientName ?? c.name ?? "",
    address: c.clientAddress ?? c.address ?? "",
    contactName: c.contactName ?? "",
    phone: c.contactPhone ?? c.phone ?? "",
    email: c.contactEmail ?? c.email ?? "",
    createdAt: c.createdAt ?? c.created_at,
  }));

  return {
    customers,
    error,
    isLoading,
    mutate,
  };
}
