const DEFAULT_ELECTRS_HOST = "https://mempool.space/api/";

function normalizeHost(host: string) {
  return host.endsWith("/") ? host : `${host}/`;
}

function getElectrsBaseUrl() {
  return normalizeHost(process.env.ELECTRS_API_HOST || DEFAULT_ELECTRS_HOST);
}

export type TransactionVout = {
  scriptpubkey: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
  scriptpubkey_address?: string;
  value: number;
};

export type TransactionInfo = {
  txid: string;
  vout: TransactionVout[];
};

function isTransactionInfo(data: unknown): data is TransactionInfo {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.txid === "string" &&
    Array.isArray(candidate.vout)
  );
}

/**
 * Fetches transaction info from Electrs API.
 * Returns the transaction with its vouts.
 */
export async function fetchTransaction(txid: string): Promise<TransactionInfo> {
  const baseUrl = getElectrsBaseUrl();
  const url = new URL(`tx/${encodeURIComponent(txid)}`, baseUrl);

  const response = await fetch(url.toString(), {
    next: {revalidate: 60},
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    throw new Error("Transaction not found");
  }

  if (!response.ok) {
    throw new Error(`Electrs API returned ${response.status} for ${url.pathname}`);
  }

  const data = await response.json();
  if (!isTransactionInfo(data)) {
    throw new Error("Unexpected Electrs transaction payload");
  }

  return data;
}

/**
 * Gets the number of vouts for a transaction.
 */
export async function fetchTransactionVoutCount(txid: string): Promise<number> {
  const tx = await fetchTransaction(txid);
  return tx.vout.length;
}

