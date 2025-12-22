import React from "react";
import useSWR from "swr";
import fetcher from "../lib/_fetcher";
import { api } from "../lib/api";
import OrderCard from "./OrderCard";
import { useAuth } from "../context/AuthContext";

const UpcomingOrderCard = ({ order, onPress }) => {
  const { token } = useAuth();

  // Fetch stops for this specific order
  const { data: stopsData } = useSWR(
    token && order?._id ? [`${api.stops}?order=${order._id}`, token] : null,
    fetcher
  );

  const stopsArray = Array.isArray(stopsData)
    ? stopsData
    : stopsData?.data || [];

  return <OrderCard order={order} stops={stopsArray} onPress={onPress} />;
};

export default UpcomingOrderCard;
