import { ethers } from 'ethers';
import { FUJI_CHAIN_ID, switchToFuji } from './network';

export const CONTRACT_ADDRESS: string =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
    .env?.VITE_STAKEPASS_CORE_ADDRESS ||
  '0x7015c225586d4a95ebc585Ba947d7F0236A5D9d1';

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
  if (!window.ethereum) throw new Error('No wallet detected.');
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}
