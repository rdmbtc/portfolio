import { useEffect, useState } from "react";
import { fetchRepoMeta, getCachedRepoMeta, type RepoMeta } from "@/lib/repoCache";

export function useRepoMeta() {
  const [meta, setMeta] = useState<Record<string, RepoMeta>>(() => getCachedRepoMeta());

  useEffect(() => {
    let cancelled = false;
    fetchRepoMeta().then((data) => {
      if (!cancelled && Object.keys(data).length) setMeta(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return meta;
}