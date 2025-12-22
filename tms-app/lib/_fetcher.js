const fetcher = async ([url, token]) => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
};

export default fetcher;
