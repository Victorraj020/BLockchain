import deployedAddresses from "@/contracts/deployedAddresses.json";

export const LOCAL_CHAIN_ID = 31337;
export const SEPOLIA_CHAIN_ID = 11155111;

export const SUPPORTED_NETWORKS: Record<number, { name: string; rpcUrl: string; explorer: string }> = {
  31337: {
    name: "Hardhat Local",
    rpcUrl: process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545",
    explorer: "",
  },
  11155111: {
    name: "Ethereum Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc.sepolia.org",
    explorer: "https://sepolia.etherscan.io",
  },
};

// Fallback or detected addresses
export const CONTRACT_ADDRESSES = {
  deadManSwitch: deployedAddresses.contracts.DeadManSwitch.address,
  testToken: deployedAddresses.contracts.TestToken.address,
};

export const INTERVAL_OPTIONS = [
  { label: "1 Minute (Demo / Test)", value: 60, description: "Fast expiration for live presentation testing" },
  { label: "1 Hour", value: 3600, description: "Hourly heartbeat verification" },
  { label: "7 Days", value: 604800, description: "Weekly contingency interval" },
  { label: "30 Days", value: 2592000, description: "Monthly contingency check-in" },
];

export const ACTION_TYPES = [
  {
    id: 0,
    title: "Transfer Test Tokens",
    subtitle: "ERC-20 Contingency Handover",
    description: "Safely transfers locked TEST tokens directly to the beneficiary's wallet upon deadline lapse.",
  },
  {
    id: 1,
    title: "Release Encrypted Message",
    subtitle: "Off-Chain Secret Handover",
    description: "Releases off-chain cryptographic CID and access key for private text/secrets upon deadline lapse.",
  },
  {
    id: 2,
    title: "Release Encrypted Document",
    subtitle: "Digital Will & Asset Instructions",
    description: "Unlocks decentralized encrypted document payload and decryption manifesto for designated beneficiary.",
  },
];

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatInterval(seconds: number): string {
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export function formatTimestamp(timestamp: number): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
