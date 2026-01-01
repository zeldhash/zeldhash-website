const DEFAULT_API_HOST = "https://api.zeldhash.com/";
const MAX_LIMIT = 500;

export type RewardEntry = {
  block_index: number;
  reward: number;
  txid: string;
  vout: number;
  zero_count: number;
};

function normalizeHost(host: string) {
  return host.endsWith("/") ? host : `${host}/`;
}

function getApiBaseUrl() {
  return normalizeHost(process.env.ZELDHASH_API_HOST || DEFAULT_API_HOST);
}

function isRewardEntry(entry: unknown): entry is RewardEntry {
  if (!entry || typeof entry !== "object") return false;
  const candidate = entry as Record<string, unknown>;

  return (
    typeof candidate.block_index === "number" &&
    typeof candidate.reward === "number" &&
    typeof candidate.txid === "string" &&
    typeof candidate.vout === "number" &&
    typeof candidate.zero_count === "number"
  );
}

export type AddressUtxo = {
  balance: number;
  txid: string;
  vout: number;
};

function isAddressUtxo(entry: unknown): entry is AddressUtxo {
  if (!entry || typeof entry !== "object") return false;
  const candidate = entry as Record<string, unknown>;

  return (
    typeof candidate.balance === "number" &&
    typeof candidate.txid === "string" &&
    typeof candidate.vout === "number"
  );
}

export async function fetchAddressUtxos(address: string): Promise<AddressUtxo[]> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`addresses/${encodeURIComponent(address)}/utxos`, baseUrl);

  const response = await fetch(url.toString(), {
    next: {revalidate: 60},
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 400) {
    throw new Error("Too many UTXOs for this address (max 500)");
  }

  if (!response.ok) {
    throw new Error(`ZeldHash API returned ${response.status} for ${url.pathname}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected ZeldHash address UTXOs payload");
  }

  return data.filter(isAddressUtxo);
}

export type BlockStats = {
  block_index: number;
  max_zero_count: number;
  new_utxo_count: number;
  nicest_txid: string;
  reward_count: number;
  total_reward: number;
  utxo_spent_count: number;
};

export type CumulStats = BlockStats & {
  block_count: number;
};

export type BlockReward = {
  reward: number;
  txid: string;
  vout: number;
  zero_count: number;
};

export type BlockDetails = {
  block_index: number;
  block_stats: BlockStats;
  cumul_stats: CumulStats;
  rewards: BlockReward[];
};

function isBlockDetails(data: unknown): data is BlockDetails {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.block_index === "number" &&
    candidate.block_stats !== null &&
    typeof candidate.block_stats === "object" &&
    candidate.cumul_stats !== null &&
    typeof candidate.cumul_stats === "object" &&
    Array.isArray(candidate.rewards)
  );
}

function isCumulStats(data: unknown): data is CumulStats {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.block_count === "number" &&
    typeof candidate.block_index === "number" &&
    typeof candidate.max_zero_count === "number" &&
    typeof candidate.new_utxo_count === "number" &&
    typeof candidate.nicest_txid === "string" &&
    typeof candidate.reward_count === "number" &&
    typeof candidate.total_reward === "number" &&
    typeof candidate.utxo_spent_count === "number"
  );
}

/**
 * Fetches the latest cumulative stats from /blocks endpoint.
 */
export async function fetchCumulStats(): Promise<CumulStats> {
  const baseUrl = getApiBaseUrl();
  const url = new URL("blocks", baseUrl);

  const response = await fetch(url.toString(), {
    next: {revalidate: 60},
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    throw new Error("No stats available yet");
  }

  if (!response.ok) {
    throw new Error(`ZeldHash API returned ${response.status} for ${url.pathname}`);
  }

  const data = await response.json();
  if (!isCumulStats(data)) {
    throw new Error("Unexpected ZeldHash cumul stats payload");
  }

  return data;
}

export async function fetchBlockDetails(blockIndex: number): Promise<BlockDetails> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`blocks/${blockIndex}`, baseUrl);

  const response = await fetch(url.toString(), {
    next: {revalidate: 300},
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    throw new Error("Block not found");
  }

  if (response.status === 400) {
    throw new Error("Invalid block index");
  }

  if (!response.ok) {
    throw new Error(`ZeldHash API returned ${response.status} for ${url.pathname}`);
  }

  const data = await response.json();
  if (!isBlockDetails(data)) {
    throw new Error("Unexpected ZeldHash block details payload");
  }

  return data;
}

export type RewardSortMode = "block_index" | "zero_count";

export async function fetchLatestRewards(
  limit = 5,
  offset = 0,
  sort?: RewardSortMode
): Promise<RewardEntry[]> {
  const baseUrl = getApiBaseUrl();
  const url = new URL("rewards", baseUrl);

  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const safeOffset = Math.max(offset, 0);

  url.searchParams.set("limit", String(safeLimit));
  if (safeOffset > 0) url.searchParams.set("offset", String(safeOffset));
  if (sort) url.searchParams.set("sort", sort);

  const response = await fetch(url.toString(), {
    next: {revalidate: 300},
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`ZeldHash API returned ${response.status} for ${url.pathname}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected ZeldHash rewards payload");
  }

  return data.filter(isRewardEntry);
}

export type UtxoBalance = {
  balance: number;
  txid: string;
  vout: number;
};

function isUtxoBalance(entry: unknown): entry is UtxoBalance {
  if (!entry || typeof entry !== "object") return false;
  const candidate = entry as Record<string, unknown>;

  return (
    typeof candidate.balance === "number" &&
    typeof candidate.txid === "string" &&
    typeof candidate.vout === "number"
  );
}

/**
 * Fetches rewards for a specific transaction ID.
 * Returns null if no rewards are found (404).
 */
export async function fetchRewardsByTxid(txid: string): Promise<RewardEntry[] | null> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`rewards/${encodeURIComponent(txid)}`, baseUrl);

  const response = await fetch(url.toString(), {
    next: {revalidate: 300},
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 400) {
    throw new Error("Malformed txid");
  }

  if (!response.ok) {
    throw new Error(`ZeldHash API returned ${response.status} for ${url.pathname}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected ZeldHash rewards payload");
  }

  return data.filter(isRewardEntry);
}

/**
 * Fetches balances for a batch of UTXOs.
 * @param outpoints Array of outpoints in format "txid:vout"
 */
export async function fetchBatchUtxos(outpoints: string[]): Promise<UtxoBalance[]> {
  if (outpoints.length === 0) {
    return [];
  }

  if (outpoints.length > 100) {
    throw new Error("Maximum 100 outpoints per batch request");
  }

  const baseUrl = getApiBaseUrl();
  const url = new URL("utxos", baseUrl);

  const response = await fetch(url.toString(), {
    method: "POST",
    next: {revalidate: 60},
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({utxos: outpoints}),
  });

  if (response.status === 400) {
    throw new Error("Malformed outpoints in request");
  }

  if (!response.ok) {
    throw new Error(`ZeldHash API returned ${response.status} for ${url.pathname}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Unexpected ZeldHash batch UTXOs payload");
  }

  return data.filter(isUtxoBalance);
}

