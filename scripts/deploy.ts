import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying StakePassCore...');
  const StakePassCore = await ethers.getContractFactory('StakePassCore');
  const core = await StakePassCore.deploy();
  await core.waitForDeployment();
  const coreAddress = await core.getAddress();
  console.log(`  StakePassCore → ${coreAddress}`);

  console.log('Deploying RewardToken (SPASS)...');
  const RewardToken = await ethers.getContractFactory('RewardToken');
  const token = await RewardToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`  RewardToken   → ${tokenAddress}`);

  console.log('Deploying AirdropManager...');
  const AirdropManager = await ethers.getContractFactory('AirdropManager');
  const airdrop = await AirdropManager.deploy(tokenAddress, coreAddress);
  await airdrop.waitForDeployment();
  const airdropAddress = await airdrop.getAddress();
  console.log(`  AirdropManager → ${airdropAddress}`);

  console.log('\n✅ All contracts deployed.');
  console.log(`\nAdd these to your .env:`);
  console.log(`VITE_STAKEPASS_CORE_ADDRESS=${coreAddress}`);
  console.log(`VITE_SPASS_TOKEN_ADDRESS=${tokenAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
