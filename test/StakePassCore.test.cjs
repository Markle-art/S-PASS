const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('StakePassCore', function () {
  async function deployFixture() {
    const [organizer, attendee, sponsor] = await ethers.getSigners();
    const StakePassCore = await ethers.getContractFactory('StakePassCore');
    const contract = await StakePassCore.deploy();
    await contract.waitForDeployment();

    return { contract, organizer, attendee, sponsor };
  }

  it('creates an event, registers a deposit, refunds on check-in, and distributes the no-show pool', async function () {
    const { contract, organizer, attendee } = await deployFixture();

    await contract.connect(organizer).createEvent(ethers.parseEther('0.1'));
    await contract.connect(attendee).registerAndStake(1, { value: ethers.parseEther('0.1') });
    await contract.connect(attendee).checkInAttendee(1, attendee.address);

    const attendeeBalanceBefore = await ethers.provider.getBalance(attendee.address);
    const tx = await contract.connect(organizer).closeEventAndDistributePool(1);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const attendeeBalanceAfter = await ethers.provider.getBalance(attendee.address);
    const eventCount = await contract.eventCount();
    const checkedInCount = await contract.getCheckedInAttendees(1);
    const isActive = await contract.events(1);

    expect(eventCount).to.equal(1n);
    expect(checkedInCount.length).to.equal(1);
    expect(isActive[5]).to.equal(false);
    expect(attendeeBalanceAfter + gasUsed > attendeeBalanceBefore).to.equal(true);
  });

  it('accepts sponsor deposits and pays sponsor rewards to completed tasks', async function () {
    const { contract, organizer, attendee, sponsor } = await deployFixture();

    await contract.connect(organizer).createEvent(ethers.parseEther('0.1'));
    await contract.connect(attendee).registerAndStake(1, { value: ethers.parseEther('0.1') });
    await contract.connect(organizer).markSponsorTaskCompleted(1, attendee.address);

    const sponsorDeposit = ethers.parseEther('1');
    await contract.connect(sponsor).sponsorDeposit(1, { value: sponsorDeposit });

    const before = await ethers.provider.getBalance(attendee.address);
    const tx = await contract.connect(attendee).claimSponsorReward(1, attendee.address);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
    const after = await ethers.provider.getBalance(attendee.address);

    expect(after + gasUsed > before).to.equal(true);
  });
});
