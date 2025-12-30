import useSWR from "swr";
import { fetcher, getAuthToken } from "@/lib/fetcher";

export function useTrucks() {
  const token = getAuthToken();

  const { data, error, isLoading, mutate } = useSWR(token ? "/trucks" : null, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const list = Array.isArray(data) ? data : data?.data || [];

  const trucks = list.map((t) => ({
    _id: t?._id,
    id: t?._id,
    licensePlate: t?.licensePlate || "",
    vin: t?.vin || "",
    brand: t?.brand || "",
    model: t?.model || "",
    year: t?.year ?? null,
    type: t?.type || "",
    driver: t?.driver || null,
    trailer: t?.trailer || null,
    status: t?.status,
    createdAt: t?.createdAt,
  }));

  return { trucks, error, isLoading, mutate };
}
