import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import SupplyChainABI from '@/contracts/SupplyChain.json';

// Network configurations
const NETWORKS = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Test Network',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  },
  mumbai: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Mumbai Polygon Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com']
  }
};

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESSES = {
  sepolia: '0x0000000000000000000000000000000000000000', // Replace with actual deployed address
  mumbai: '0x0000000000000000000000000000000000000000'  // Replace with actual deployed address
};

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  chainId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  stakeholder: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: keyof typeof NETWORKS) => Promise<void>;
  registerStakeholder: (role: number, name: string, organization: string) => Promise<void>;
  registerProduct: (productData: any) => Promise<number>;
  transferProduct: (productId: number, to: string, newStatus: number, location: string, transactionType: string, additionalData: string) => Promise<void>;
  getProduct: (productId: number) => Promise<any>;
  getProductTransactions: (productId: number) => Promise<any[]>;
  getProductsByFarmer: (farmerAddress: string) => Promise<number[]>;
  isProductAuthentic: (productId: number, dataHash: string) => Promise<boolean>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stakeholder, setStakeholder] = useState<any>(null);

  const getContractAddress = (chainId: string) => {
    if (chainId === '0xaa36a7') return CONTRACT_ADDRESSES.sepolia;
    if (chainId === '0x13881') return CONTRACT_ADDRESSES.mumbai;
    return null;
  };

  const initializeContract = async (provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner, chainId: string) => {
    const contractAddress = getContractAddress(chainId);
    
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('Contract not deployed on this network');
      return null;
    }

    try {
      const contractInstance = new ethers.Contract(contractAddress, SupplyChainABI.abi, signer);
      return contractInstance;
    } catch (error) {
      console.error('Error initializing contract:', error);
      return null;
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this application.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = '0x' + network.chainId.toString(16);

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setChainId(chainId);
      setIsConnected(true);

      // Initialize contract
      const contractInstance = await initializeContract(provider, signer, chainId);
      setContract(contractInstance);

      // Load stakeholder data if contract is available
      if (contractInstance) {
        try {
          const stakeholderData = await contractInstance.getStakeholder(accounts[0]);
          setStakeholder(stakeholderData);
        } catch (error) {
          console.log('Stakeholder not registered yet');
        }
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });

    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setChainId(null);
    setIsConnected(false);
    setStakeholder(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const switchNetwork = async (network: keyof typeof NETWORKS) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS[network].chainId }],
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS[network]],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      } else {
        console.error('Error switching network:', error);
      }
    }
  };

  const registerStakeholder = async (role: number, name: string, organization: string) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const tx = await contract.registerStakeholder(role, name, organization);
      toast({
        title: "Transaction Submitted",
        description: "Registering stakeholder...",
      });

      await tx.wait();
      
      // Reload stakeholder data
      const stakeholderData = await contract.getStakeholder(account);
      setStakeholder(stakeholderData);

      toast({
        title: "Success",
        description: "Stakeholder registered successfully!",
      });
    } catch (error: any) {
      console.error('Error registering stakeholder:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register stakeholder",
        variant: "destructive",
      });
      throw error;
    }
  };

  const registerProduct = async (productData: any): Promise<number> => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const tx = await contract.registerProduct(
        productData.name,
        productData.variety,
        productData.quantity,
        productData.farmLocation,
        Math.floor(new Date(productData.harvestDate).getTime() / 1000),
        productData.qualityGrade,
        productData.dataHash
      );

      toast({
        title: "Transaction Submitted",
        description: "Registering product on blockchain...",
      });

      const receipt = await tx.wait();
      
      // Find the ProductRegistered event to get the product ID
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'ProductRegistered';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = contract.interface.parseLog(event);
        const productId = parsed?.args.productId;
        
        toast({
          title: "Success",
          description: `Product registered with ID: ${productId}`,
        });
        
        return Number(productId);
      }
      
      throw new Error('Product ID not found in transaction receipt');
    } catch (error: any) {
      console.error('Error registering product:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const transferProduct = async (
    productId: number,
    to: string,
    newStatus: number,
    location: string,
    transactionType: string,
    additionalData: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');

    try {
      const tx = await contract.transferProduct(
        productId,
        to,
        newStatus,
        location,
        transactionType,
        additionalData
      );

      toast({
        title: "Transaction Submitted",
        description: "Transferring product...",
      });

      await tx.wait();

      toast({
        title: "Success",
        description: "Product transferred successfully!",
      });
    } catch (error: any) {
      console.error('Error transferring product:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getProduct = async (productId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getProduct(productId);
  };

  const getProductTransactions = async (productId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getProductTransactions(productId);
  };

  const getProductsByFarmer = async (farmerAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.getProductsByFarmer(farmerAddress);
  };

  const isProductAuthentic = async (productId: number, dataHash: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return await contract.isProductAuthentic(productId, dataHash);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        window.location.reload(); // Reload the page when network changes
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    contract,
    chainId,
    isConnected,
    isLoading,
    stakeholder,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    registerStakeholder,
    registerProduct,
    transferProduct,
    getProduct,
    getProductTransactions,
    getProductsByFarmer,
    isProductAuthentic,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};