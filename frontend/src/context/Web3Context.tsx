"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import deployedAddresses from "@/contracts/deployedAddresses.json";
import DeadManSwitchABI from "@/contracts/DeadManSwitchABI.json";
import TestTokenABI from "@/contracts/TestTokenABI.json";
import { CONTRACT_ADDRESSES, LOCAL_CHAIN_ID, SUPPORTED_NETWORKS } from "@/lib/constants";

export interface VaultData {
  id: number;
  owner: string;
  beneficiary: string;
  name: string;
  description: string;
  checkInInterval: number;
  lastCheckIn: number;
  actionType: number; // 0: TOKEN_TRANSFER, 1: ENCRYPTED_MESSAGE, 2: ENCRYPTED_DOCUMENT
  tokenAddress: string;
  tokenAmount: string; // formatted in TEST (e.g. "100.0")
  tokenAmountRaw: bigint;
  depositedAmount: string; // formatted in TEST
  depositedAmountRaw: bigint;
  payloadHash: string;
  status: number; // 0: ACTIVE, 1: EXECUTED, 2: CANCELLED
  createdAt: number;
  executedAt: number;
  deadline: number;
  isEligible: boolean;
}

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  networkName: string;
  ethBalance: string;
  tokenBalance: string;
  isConnecting: boolean;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  vaults: VaultData[];
  activeVault: VaultData | null;
  isLoadingVaults: boolean;
  txPending: boolean;
  lastTxHash: string | null;
  txError: string | null;
  txSuccessMessage: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
  refreshData: () => Promise<void>;
  checkIn: (vaultId: number) => Promise<boolean>;
  triggerSwitch: (vaultId: number) => Promise<boolean>;
  cancelVault: (vaultId: number) => Promise<boolean>;
  updateBeneficiary: (vaultId: number, newBeneficiary: string) => Promise<boolean>;
  claimFaucet: () => Promise<boolean>;
  depositTokens: (vaultId: number, amount: string) => Promise<boolean>;
  approveAndCreateVault: (
    params: {
      name: string;
      description: string;
      beneficiary: string;
      checkInInterval: number;
      actionType: number;
      tokenAmount: string;
      payloadHash: string;
    }
  ) => Promise<{ success: boolean; vaultId?: number }>;
  fastForwardTime: (seconds: number) => Promise<boolean>;
  setActiveVaultId: (id: number) => void;
  clearNotifications: () => void;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [ethBalance, setEthBalance] = useState<string>("0.00");
  const [tokenBalance, setTokenBalance] = useState<string>("0.00");
  const [isConnecting, setIsConnecting] = useState(false);
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [activeVaultId, setActiveVaultIdState] = useState<number>(1);
  const [isLoadingVaults, setIsLoadingVaults] = useState(false);

  const [txPending, setTxPending] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccessMessage, setTxSuccessMessage] = useState<string | null>(null);

  const clearNotifications = useCallback(() => {
    setTxError(null);
    setTxSuccessMessage(null);
    setLastTxHash(null);
  }, []);

  // Read-only RPC provider fallback
  const getFallbackProvider = useCallback(() => {
    const localRpc = process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545";
    return new ethers.JsonRpcProvider(localRpc);
  }, []);

  // Get active provider (BrowserProvider if wallet connected, fallback RPC otherwise)
  const getProvider = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    return getFallbackProvider();
  }, [getFallbackProvider]);

  // Get signer (if connected)
  const getSigner = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum && account) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return await provider.getSigner();
    }
    return null;
  }, [account]);

  // Read contracts
  const getReadContracts = useCallback(async () => {
    const provider = await getProvider();
    const deadManSwitch = new ethers.Contract(
      CONTRACT_ADDRESSES.deadManSwitch,
      DeadManSwitchABI,
      provider
    );
    const testToken = new ethers.Contract(
      CONTRACT_ADDRESSES.testToken,
      TestTokenABI,
      provider
    );
    return { deadManSwitch, testToken, provider };
  }, [getProvider]);

  // Parse raw contract vault struct into frontend VaultData
  const formatVaultStruct = (v: any): VaultData => {
    const id = Number(v.id);
    const checkInInterval = Number(v.checkInInterval);
    const lastCheckIn = Number(v.lastCheckIn);
    const deadline = lastCheckIn + checkInInterval;
    const now = Math.floor(Date.now() / 1000);
    const isEligible = Number(v.status) === 0 && now > deadline;

    return {
      id,
      owner: v.owner,
      beneficiary: v.beneficiary,
      name: v.name,
      description: v.description,
      checkInInterval,
      lastCheckIn,
      actionType: Number(v.actionType),
      tokenAddress: v.tokenAddress,
      tokenAmount: ethers.formatEther(v.tokenAmount || BigInt(0)),
      tokenAmountRaw: v.tokenAmount || BigInt(0),
      depositedAmount: ethers.formatEther(v.depositedAmount || BigInt(0)),
      depositedAmountRaw: v.depositedAmount || BigInt(0),
      payloadHash: v.payloadHash || "",
      status: Number(v.status),
      createdAt: Number(v.createdAt),
      executedAt: Number(v.executedAt),
      deadline,
      isEligible,
    };
  };

  // Fetch balances and vaults
  const refreshData = useCallback(async () => {
    try {
      setIsLoadingVaults(true);
      const { deadManSwitch, testToken, provider } = await getReadContracts();

      // Balances
      if (account) {
        try {
          const ethBal = await provider.getBalance(account);
          setEthBalance(parseFloat(ethers.formatEther(ethBal)).toFixed(4));
        } catch (e) {
          console.warn("Could not fetch ETH balance:", e);
        }

        try {
          const tokBal = await testToken.balanceOf(account);
          setTokenBalance(parseFloat(ethers.formatEther(tokBal)).toFixed(2));
        } catch (e) {
          console.warn("Could not fetch TEST token balance:", e);
        }
      }

      // Fetch all vaults
      try {
        const rawVaults = await deadManSwitch.getAllVaults();
        const parsed: VaultData[] = rawVaults.map(formatVaultStruct);
        setVaults(parsed);
      } catch (err) {
        console.warn("Could not load all vaults:", err);
      }
    } catch (error) {
      console.error("refreshData error:", error);
    } finally {
      setIsLoadingVaults(false);
    }
  }, [account, getReadContracts]);

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setTxError("MetaMask not found. Please install MetaMask to interact with this dApp.");
      return;
    }
    try {
      setIsConnecting(true);
      clearNotifications();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setTxError(err?.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setEthBalance("0.00");
    setTokenBalance("0.00");
  };

  // Switch Network (Hardhat 31337 or Sepolia 11155111)
  const switchNetwork = async (targetChainId: number) => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const hexChainId = `0x${targetChainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
      setChainId(targetChainId);
    } catch (switchError: any) {
      // 4902 means the chain has not been added to MetaMask
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        if (targetChainId === LOCAL_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexChainId,
                  chainName: "Hardhat Localhost",
                  rpcUrls: ["http://127.0.0.1:8545"],
                  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                },
              ],
            });
            setChainId(targetChainId);
          } catch (addError) {
            console.error("Could not add chain:", addError);
          }
        }
      } else {
        console.error("Failed to switch network:", switchError);
        setTxError(switchError?.message || "Could not switch network.");
      }
    }
  };

  const ensureCorrectNetwork = async (): Promise<boolean> => {
    if (chainId !== LOCAL_CHAIN_ID && chainId !== 11155111) {
      await switchNetwork(LOCAL_CHAIN_ID);
      return false;
    }
    return true;
  };

  // Listeners for account and network changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainHex: string) => {
      setChainId(parseInt(chainHex, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Initial check if already authorized
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accs: string[]) => {
        if (accs.length > 0) {
          setAccount(accs[0]);
        }
      })
      .catch(() => {});

    window.ethereum
      .request({ method: "eth_chainId" })
      .then((cId: string) => {
        setChainId(parseInt(cId, 16));
      })
      .catch(() => {});

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Poll refresh every 10 seconds for live deadlines
  useEffect(() => {
    refreshData();
    const timer = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(timer);
  }, [refreshData]);

  // Check In ("I'm Still Active")
  const checkIn = async (vaultId: number): Promise<boolean> => {
    clearNotifications();
    const signer = await getSigner();
    if (!signer) {
      setTxError("Please connect your wallet first.");
      return false;
    }

    try {
      setTxPending(true);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.deadManSwitch,
        DeadManSwitchABI,
        signer
      );

      const tx = await contract.checkIn(vaultId);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxSuccessMessage("Proof of life confirmed! Check-in deadline reset.");
        await refreshData();
        return true;
      } else {
        setTxError("Transaction failed on-chain.");
        return false;
      }
    } catch (err: any) {
      console.error("checkIn error:", err);
      const msg = err?.reason || err?.message || "Failed to check in.";
      setTxError(msg);
      return false;
    } finally {
      setTxPending(false);
    }
  };

  // Trigger Switch
  const triggerSwitch = async (vaultId: number): Promise<boolean> => {
    clearNotifications();
    const signer = await getSigner();
    if (!signer) {
      setTxError("Please connect your wallet first.");
      return false;
    }

    try {
      setTxPending(true);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.deadManSwitch,
        DeadManSwitchABI,
        signer
      );

      const tx = await contract.triggerSwitch(vaultId);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxSuccessMessage("Contingency switch triggered! Assets released to beneficiary.");
        await refreshData();
        return true;
      } else {
        setTxError("Trigger transaction failed on-chain.");
        return false;
      }
    } catch (err: any) {
      console.error("triggerSwitch error:", err);
      const msg = err?.reason || err?.message || "Failed to trigger switch.";
      setTxError(msg);
      return false;
    } finally {
      setTxPending(false);
    }
  };

  // Cancel Vault
  const cancelVault = async (vaultId: number): Promise<boolean> => {
    clearNotifications();
    const signer = await getSigner();
    if (!signer) {
      setTxError("Please connect your wallet first.");
      return false;
    }

    try {
      setTxPending(true);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.deadManSwitch,
        DeadManSwitchABI,
        signer
      );

      const tx = await contract.cancelVault(vaultId);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxSuccessMessage("Vault cancelled. Any remaining deposited tokens were refunded to your wallet.");
        await refreshData();
        return true;
      } else {
        setTxError("Cancellation failed.");
        return false;
      }
    } catch (err: any) {
      console.error("cancelVault error:", err);
      const msg = err?.reason || err?.message || "Failed to cancel vault.";
      setTxError(msg);
      return false;
    } finally {
      setTxPending(false);
    }
  };

  // Update Beneficiary
  const updateBeneficiary = async (vaultId: number, newBeneficiary: string): Promise<boolean> => {
    clearNotifications();
    const signer = await getSigner();
    if (!signer) {
      setTxError("Please connect your wallet first.");
      return false;
    }

    try {
      setTxPending(true);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.deadManSwitch,
        DeadManSwitchABI,
        signer
      );

      const tx = await contract.updateBeneficiary(vaultId, newBeneficiary);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxSuccessMessage("Beneficiary wallet updated successfully.");
        await refreshData();
        return true;
      } else {
        setTxError("Beneficiary update failed.");
        return false;
      }
    } catch (err: any) {
      console.error("updateBeneficiary error:", err);
      const msg = err?.reason || err?.message || "Failed to update beneficiary.";
      setTxError(msg);
      return false;
    } finally {
      setTxPending(false);
    }
  };

  // Claim Faucet (1,000 TEST tokens)
  const claimFaucet = async (): Promise<boolean> => {
    clearNotifications();
    const isNetworkOk = await ensureCorrectNetwork();
    if (!isNetworkOk) {
      setTxError("Switched network to Hardhat Localhost. Please click 'Claim 1k TEST' again.");
      return false;
    }

    const signer = await getSigner();
    if (!signer || !account) {
      setTxError("Please connect your wallet first.");
      return false;
    }

    try {
      setTxPending(true);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.testToken,
        TestTokenABI,
        signer
      );

      const tx = await contract.faucet(account);
      setLastTxHash(tx.hash);

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxSuccessMessage("Claimed 1,000 TEST tokens successfully!");
        await refreshData();
        return true;
      } else {
        setTxError("Faucet claim failed.");
        return false;
      }
    } catch (err: any) {
      console.error("claimFaucet error:", err);
      const msg = err?.reason || err?.message || "Faucet claim failed.";
      setTxError(msg);
      return false;
    } finally {
      setTxPending(false);
    }
  };

  // Deposit Tokens
  const depositTokens = async (vaultId: number, amount: string): Promise<boolean> => {
    clearNotifications();
    const signer = await getSigner();
    if (!signer) {
      setTxError("Please connect your wallet first.");
      return false;
    }

    try {
      setTxPending(true);
      const parsedAmount = ethers.parseEther(amount);
      const testToken = new ethers.Contract(
        CONTRACT_ADDRESSES.testToken,
        TestTokenABI,
        signer
      );
      const deadManSwitch = new ethers.Contract(
        CONTRACT_ADDRESSES.deadManSwitch,
        DeadManSwitchABI,
        signer
      );

      // Check allowance
      const allowance = await testToken.allowance(account, CONTRACT_ADDRESSES.deadManSwitch);
      if (allowance < parsedAmount) {
        setTxSuccessMessage("Step 1/2: Approving TEST token transfer in MetaMask...");
        const approveTx = await testToken.approve(CONTRACT_ADDRESSES.deadManSwitch, parsedAmount);
        await approveTx.wait();
      }

      setTxSuccessMessage("Step 2/2: Confirming deposit into vault...");
      const depositTx = await deadManSwitch.depositTokens(vaultId, parsedAmount);
      setLastTxHash(depositTx.hash);
      const receipt = await depositTx.wait();

      if (receipt.status === 1) {
        setTxSuccessMessage(`Successfully deposited ${amount} TEST into Vault #${vaultId}!`);
        await refreshData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("depositTokens error:", err);
      setTxError(err?.reason || err?.message || "Deposit failed.");
      return false;
    } finally {
      setTxPending(false);
    }
  };

  // Create Vault and fund
  const approveAndCreateVault = async (params: {
    name: string;
    description: string;
    beneficiary: string;
    checkInInterval: number;
    actionType: number;
    tokenAmount: string;
    payloadHash: string;
  }): Promise<{ success: boolean; vaultId?: number }> => {
    clearNotifications();
    const signer = await getSigner();
    if (!signer) {
      setTxError("Please connect your wallet first.");
      return { success: false };
    }

    try {
      setTxPending(true);
      const deadManSwitch = new ethers.Contract(
        CONTRACT_ADDRESSES.deadManSwitch,
        DeadManSwitchABI,
        signer
      );
      const testToken = new ethers.Contract(
        CONTRACT_ADDRESSES.testToken,
        TestTokenABI,
        signer
      );

      const parsedTokenAmount =
        params.actionType === 0 && params.tokenAmount
          ? ethers.parseEther(params.tokenAmount)
          : BigInt(0);

      // 1. If Token Transfer action, check and approve allowance
      if (params.actionType === 0 && parsedTokenAmount > BigInt(0)) {
        setTxSuccessMessage("Step 1/3: Approving TEST token spending in MetaMask...");
        const allowance = await testToken.allowance(account, CONTRACT_ADDRESSES.deadManSwitch);
        if (allowance < parsedTokenAmount) {
          const approveTx = await testToken.approve(
            CONTRACT_ADDRESSES.deadManSwitch,
            parsedTokenAmount
          );
          await approveTx.wait();
        }
      }

      // 2. Create the vault
      setTxSuccessMessage("Step 2/3: Creating contingency vault on-chain...");
      const createParams = {
        name: params.name,
        description: params.description,
        beneficiary: params.beneficiary,
        checkInInterval: params.checkInInterval,
        actionType: params.actionType,
        tokenAddress: params.actionType === 0 ? CONTRACT_ADDRESSES.testToken : ethers.ZeroAddress,
        tokenAmount: parsedTokenAmount,
        payloadHash: params.payloadHash,
      };

      const createTx = await deadManSwitch.createVault(createParams);
      setLastTxHash(createTx.hash);
      const receipt = await createTx.wait();

      // Find VaultCreated event to get vaultId
      let createdVaultId = 1;
      for (const log of receipt.logs) {
        try {
          const parsedLog = deadManSwitch.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "VaultCreated") {
            createdVaultId = Number(parsedLog.args.vaultId);
            break;
          }
        } catch {
          // Skip unrelated logs
        }
      }

      // 3. Fund the vault if token transfer
      if (params.actionType === 0 && parsedTokenAmount > BigInt(0)) {
        setTxSuccessMessage(`Step 3/3: Depositing ${params.tokenAmount} TEST into Vault #${createdVaultId}...`);
        const depositTx = await deadManSwitch.depositTokens(createdVaultId, parsedTokenAmount);
        await depositTx.wait();
      }

      setTxSuccessMessage(`Vault #${createdVaultId} ("${params.name}") successfully created and funded!`);
      await refreshData();
      setActiveVaultIdState(createdVaultId);
      return { success: true, vaultId: createdVaultId };
    } catch (err: any) {
      console.error("createVault error:", err);
      setTxError(err?.reason || err?.message || "Failed to create vault.");
      return { success: false };
    } finally {
      setTxPending(false);
    }
  };

  // Fast forward time on local Hardhat RPC (for instant deadline test)
  const fastForwardTime = async (seconds: number): Promise<boolean> => {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545"
      );
      await provider.send("evm_increaseTime", [seconds]);
      await provider.send("evm_mine", []);
      setTxSuccessMessage(`Fast-forwarded local blockchain clock by ${seconds} seconds.`);
      await refreshData();
      return true;
    } catch (err: any) {
      console.warn("Fast-forward only works on local Hardhat node:", err);
      setTxError("Fast-forward is only supported on a local Hardhat network node.");
      return false;
    }
  };

  const activeVault = vaults.find((v) => v.id === activeVaultId) || vaults[0] || null;
  const isCorrectNetwork = chainId === LOCAL_CHAIN_ID || chainId === 11155111;
  const networkName =
    chainId && SUPPORTED_NETWORKS[chainId]
      ? SUPPORTED_NETWORKS[chainId].name
      : chainId
      ? `Unknown (${chainId})`
      : "Not Connected";

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        networkName,
        ethBalance,
        tokenBalance,
        isConnecting,
        isConnected: !!account,
        isCorrectNetwork,
        vaults,
        activeVault,
        isLoadingVaults,
        txPending,
        lastTxHash,
        txError,
        txSuccessMessage,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshData,
        checkIn,
        triggerSwitch,
        cancelVault,
        updateBeneficiary,
        claimFaucet,
        depositTokens,
        approveAndCreateVault,
        fastForwardTime,
        setActiveVaultId: (id) => setActiveVaultIdState(id),
        clearNotifications,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
