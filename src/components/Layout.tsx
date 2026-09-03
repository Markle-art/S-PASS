import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { Menu, Wallet, LogOut, ChevronDown, Coins } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { FUJI_CHAIN_ID, switchToFuji } from '../utils/network';
import { useAuth } from '../context/AuthContext';
import { roleLabel } from '../data/users';
import { fetchSpassBalance } from '../utils/contract';
import { getDemoSpassBalance } from '../services/eventService';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [spassBalance, setSpassBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const updateBalance = useCallback(async (address: string) => {
    if (!address) return;
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(address);
        setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
      }
      const onchainSpass = await fetchSpassBalance(address);
      const demoSpass = getDemoSpassBalance(address);
      const totalSpass = (parseFloat(onchainSpass) || 0) + demoSpass;
      setSpassBalance(totalSpass.toFixed(0));
    } catch (err) {
      console.warn('Balance update failed:', err);
    }
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
        setSpassBalance('0');
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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xl font-black uppercase tracking-tight text-white transition hover:opacity-90"
          >
            Stake<span className="text-[#e60012]">Pass</span>
            {!isHome && (
              <ChevronDown size={16} className="ml-1 rotate-90 text-white/30" />
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {isAuthenticated && user && (
              <button
                onClick={() => navigate('/login')}
                className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 sm:inline-flex"
                title={`Signed in as ${user.name}`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e60012] text-[10px] font-black uppercase text-white">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-xs font-bold text-white">{user.name}</span>
                  <span className="block text-[10px] uppercase tracking-wide text-white/40">
                    {roleLabel[user.role]}
                  </span>
                </span>
              </button>
            )}

            {chainId && (
              <span
                className={`hidden items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold md:inline-flex ${
                  chainId === FUJI_CHAIN_ID
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    chainId === FUJI_CHAIN_ID ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {chainId === FUJI_CHAIN_ID ? 'Avalanche Fuji' : `Chain ${chainId}`}
              </span>
            )}

            {walletAddress && balance && (
              <span className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 lg:inline-flex">
                {balance} AVAX
              </span>
            )}

            {walletAddress && (
              <button
                onClick={() => navigate('/rewards')}
                title="Your StakePass SPASS Reward Tokens"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e60012]/40 bg-[#e60012]/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#e60012]/25"
              >
                <Coins size={13} className="text-[#ff6666]" />
                <span className="text-[#ff5555]">{spassBalance}</span>
                <span className="text-white/80">SPASS</span>
              </button>
            )}

            <button
              onClick={() => (isAuthenticated ? logout() : navigate('/login'))}
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/30 hover:text-white md:inline-flex"
            >
              {isAuthenticated ? (
                <>
                  <LogOut size={14} />
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#e60012] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 shadow-[0_4px_20px_rgba(230,0,18,0.35)]"
            >
              <Wallet size={14} />
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
              className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:border-white/30 hover:text-white"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet
          context={{
            walletAddress,
            balance,
            spassBalance,
            chainId,
            connectWallet,
            user,
            isAuthenticated,
            refreshBalances: () => updateBalance(walletAddress),
          }}
        />
      </main>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

