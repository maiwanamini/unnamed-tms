import useSWR from "swr";
import { fetcher, getAuthToken } from "@/lib/fetcher";

export function useTrailers() {
  const token = getAuthToken();

  const { data, error, isLoading, mutate } = useSWR(token ? "/trailers" : null, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const list = Array.isArray(data) ? data : data?.data || [];

  const trailers = list.map((t) => ({
    _id: t?._id,
    id: t?._id,
    licensePlate: t?.licensePlate || "",
    brand: t?.brand || "",
    model: t?.model || "",
    year: t?.year ?? null,
    type: t?.type || "",
    truck: t?.truck || null,
    status: t?.status,
    createdAt: t?.createdAt,
  }));

  return { trailers, error, isLoading, mutate };
}
