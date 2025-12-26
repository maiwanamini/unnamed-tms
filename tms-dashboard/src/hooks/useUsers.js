import useSWR from "swr";
import { fetcher, getAuthToken } from "@/lib/fetcher";

export function useUsers() {
  const token = getAuthToken();

  const { data, error, isLoading, mutate } = useSWR(token ? "/users" : null, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const list = Array.isArray(data) ? data : data?.data || [];

  const users = list.map((u) => ({
    _id: u?._id,
    id: u?._id,
    firstName: u?.firstName || "",
    lastName: u?.lastName || "",
    fullName: u?.fullName || `${u?.firstName || ""} ${u?.lastName || ""}`.trim(),
    email: u?.email || "",
    phone: u?.phone || "",
    role: u?.role || "",
    company: u?.company || null,
    avatarUrl: u?.avatarUrl || u?.profileImageUrl || u?.photoUrl || u?.imageUrl || "",
    truck: u?.truck || null,
    createdAt: u?.createdAt,
  }));

  return { users, error, isLoading, mutate };
}
