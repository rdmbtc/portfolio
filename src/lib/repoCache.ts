export interface RepoMeta {
  name: string;
  stars: number;
  language: string | null;
  description: string | null;
  updated_at?: string;
  homepage?: string | null;
}

const KEY = "rdm:repo-meta:v1";
const TTL = 1000 * 60 * 60 * 6; // 6 hours

function readCache(): { ts: number; data: Record<string, RepoMeta> } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(data: Record<string, RepoMeta>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* quota — ignore */
  }
}

let inflight: Promise<Record<string, RepoMeta>> | null = null;

export async function fetchRepoMeta(user = "rdmbtc"): Promise<Record<string, RepoMeta>> {
  const cached = readCache();
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
      if (!res.ok) throw new Error(`${res.status}`);
      const list = (await res.json()) as Array<{
        name: string; stargazers_count: number; language: string | null;
        description: string | null; updated_at: string; homepage: string | null;
      }>;
      const map: Record<string, RepoMeta> = {};
      for (const r of list) {
        map[r.name] = {
          name: r.name,
          stars: r.stargazers_count ?? 0,
          language: r.language,
          description: r.description,
          updated_at: r.updated_at,
          homepage: r.homepage,
        };
      }
      writeCache(map);
      return map;
    } catch {
      return cached?.data ?? {};
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Synchronous cache read for instant hydration on first render. */
export function getCachedRepoMeta(): Record<string, RepoMeta> {
  return readCache()?.data ?? {};
}