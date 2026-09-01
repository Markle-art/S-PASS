import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { Menu, Wallet, LogOut, ChevronDown } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { FUJI_CHAIN_ID, switchToFuji } from '../utils/network';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../data/users';

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
  const [isConnecting, setIsConnecting] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xl font-black uppercase tracking-tight text-white"
          >
            Stake<span className="text-[#e60012]">Pass</span>
            {!isHome && (
              <ChevronDown size={16} className="ml-1 rotate-90 text-white/30" />
            )}
          </button>

          <div className="flex items-center gap-2.5">
            {isAuthenticated && user && (
              <button
                onClick={() => navigate('/login')}
                className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 sm:inline-flex"
                title={`Signed in as ${user.name}`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e60012] text-[10px] font-black uppercase text-white">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-xs font-semibold text-white">{user.name}</span>
                  <span className="block text-[10px] uppercase tracking-wide text-white/40">
                    {roleLabel[user.role]}
                  </span>
                </span>
              </button>
            )}

            {chainId && (
              <span
                className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium md:inline-flex ${
                  chainId === FUJI_CHAIN_ID
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    chainId === FUJI_CHAIN_ID ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {chainId === FUJI_CHAIN_ID ? 'Fuji' : `Chain ${chainId}`}
              </span>
            )}

            {walletAddress && balance && (
              <span className="hidden rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-white/60 lg:inline-flex">
                {balance} AVAX
              </span>
            )}

            <button
              onClick={() => (isAuthenticated ? logout() : navigate('/login'))}
              className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white md:inline-flex"
            >
              {isAuthenticated ? (
                <>
                  <LogOut size={15} />
                  Sign out
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e60012]" />
                  Sign in
                </>
              )}
            </button>

            <button
              onClick={connectWallet}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#e60012] px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Wallet size={15} />
              {isConnecting ? (
                'Connecting…'
              ) : walletAddress ? (
                `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
              ) : (
                'Connect Wallet'
              )}
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:border-white/30 hover:text-white"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="font-montserrat-thin">
        <Outlet
          context={{ walletAddress, balance, chainId, connectWallet, user, isAuthenticated }}
        />
      </main>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}