import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { Menu, Wallet, ChevronDown } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { FUJI_CHAIN_ID, switchToFuji } from '../utils/network';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const updateBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const bal = await provider.getBalance(address);
    setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('No wallet found. Install MetaMask or Rabby.');
      return;
    }
    try {
      setIsConnecting(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      if (currentChainId !== FUJI_CHAIN_ID) {
        const switched = await switchToFuji();
        if (!switched) {
          alert('This app requires Avalanche Fuji testnet. Please switch to Fuji (Chain ID 43113) in your wallet.');
          setIsConnecting(false);
          return;
        }
        setChainId(FUJI_CHAIN_ID);
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      await updateBalance(address);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;
    const handleChainChanged = () => window.location.reload();
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletAddress('');
        setBalance('');
      } else {
        setWalletAddress(accounts[0]);
        updateBalance(accounts[0]);
      }
    };
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [updateBalance]);

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-gray-900"
          >
            Stake<span className="text-brand-600">Pass</span>
            {!isHome && (
              <ChevronDown size={16} className="ml-1 rotate-90 text-gray-400" />
            )}
          </button>

          <div className="flex items-center gap-3">
            {chainId && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  chainId === FUJI_CHAIN_ID
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    chainId === FUJI_CHAIN_ID ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {chainId === FUJI_CHAIN_ID ? 'Fuji' : `Chain ${chainId}`}
              </span>
            )}

            {walletAddress && balance && (
              <span className="hidden rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 sm:inline-flex">
                {balance} AVAX
              </span>
            )}

            <button
              onClick={connectWallet}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-gray-800 sm:gap-2 sm:px-4 sm:text-sm"
            >

              <Wallet size={15} />
              {isConnecting
                ? 'Connecting…'
                : walletAddress
                  ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
                  : 'Connect Wallet'}
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet context={{ walletAddress, connectWallet }} />
      </main>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
