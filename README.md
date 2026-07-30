# EventToken MVP

EventToken is an Avalanche Fuji-based MVP for event attendance verification and token airdrops.

## Features
- Wallet-ready React + TypeScript UI
- Solidity contracts for event registry, attendance, and airdrop management
- QR-based check-in experience
- Organizer dashboard for attendee review and token airdrops

## Smart contracts
- contracts/EventRegistry.sol
- contracts/Attendance.sol
- contracts/RewardToken.sol
- contracts/AirdropManager.sol

## Local development
1. Install dependencies: npm install
2. Start the frontend: npm run dev
3. Compile contracts: npm run compile
4. Deploy to Fuji: npm run deploy:fuji

## Environment variables
Create a .env file with:
- AVALANCHE_FUJI_RPC_URL
- PRIVATE_KEY

## Demo flow
1. Connect wallet
2. Register for the event
3. Scan the QR code during the event
4. Review attendees in the organizer dashboard
5. Trigger the airdrop
