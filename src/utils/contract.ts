import { ethers } from 'ethers';
import { FUJI_CHAIN_ID, switchToFuji, getFallbackProvider } from './network';

export const CONTRACT_ADDRESS: string =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
    .env?.VITE_STAKEPASS_CORE_ADDRESS ||
  '0x7015c225586d4a95ebc585Ba947d7F0236A5D9d1';

export const SPASS_TOKEN_ADDRESS: string =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
    .env?.VITE_SPASS_TOKEN_ADDRESS ||
  '0x77426B5099501C023106E0a83FF75fe6F2aFE94D';

export const CONTRACT_ABI = [
  'function createEvent(uint256 _depositAmount) external returns (uint256)',
  'function registerAndStake(uint256 _eventId) external payable',
  'function checkInAttendee(uint256 _eventId, address _attendee) external',
  'function closeEventAndDistributePool(uint256 _eventId) external',
  'function sponsorDeposit(uint256 _eventId) external payable',
  'function markSponsorTaskCompleted(uint256 _eventId, address _attendee) external',
  'function claimSponsorReward(uint256 _eventId, address _attendee) external',
  'function getEvent(uint256 _eventId) external view returns ((uint256 id, address organizer, uint256 depositAmount, uint256 totalStaked, uint256 noShowPool, bool isActive, uint256 checkedInCount, uint256 sponsorBudget, bool closed))',
  'function eventCount() external view returns (uint256)',
  'function hasStaked(uint256 _eventId, address _attendee) external view returns (bool)',
  'function checkedIn(uint256 _eventId, address _attendee) external view returns (bool)',
  'function getCheckedInAttendees(uint256 _eventId) external view returns (address[])',
];

export const SPASS_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount)',
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function ensureSigner(): Promise<ethers.Signer> {
  if (!window.ethereum) throw new Error('No wallet detected. Install MetaMask or Rabby.');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== FUJI_CHAIN_ID) {
    const switched = await switchToFuji();
    if (!switched) throw new Error('Please switch to Avalanche Fuji (Chain ID 43113) in your wallet.');
  }
  return provider.getSigner();
}

export async function getContract(): Promise<ethers.Contract> {
  const signer = await ensureSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function getReadOnlyContract(): Promise<ethers.Contract> {
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    } catch {
      // fallback if browser provider fails
    }
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, getFallbackProvider());
}

export async function getSpassContract(signerOrProvider?: ethers.Signer | ethers.Provider): Promise<ethers.Contract> {
  if (signerOrProvider) {
    return new ethers.Contract(SPASS_TOKEN_ADDRESS, SPASS_ABI, signerOrProvider);
  }
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return new ethers.Contract(SPASS_TOKEN_ADDRESS, SPASS_ABI, provider);
    } catch {
      // fallback
    }
  }
  return new ethers.Contract(SPASS_TOKEN_ADDRESS, SPASS_ABI, getFallbackProvider());
}

export async function fetchSpassBalance(address: string): Promise<string> {
  try {
    const token = await getSpassContract();
    const rawBalance = await token.balanceOf(address);
    // formatted balance as whole or decimal
    return ethers.formatUnits(rawBalance, 18);
  } catch (err) {
    console.warn('Failed to query SPASS token balance:', err);
    return '0';
  }
}

