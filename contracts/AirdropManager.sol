// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract AirdropManager is Ownable {
    IERC20 public rewardToken;
    address public attendanceContract;

    event AirdropCompleted(uint256 indexed eventId, address indexed recipient, uint256 amount);

    constructor(address tokenAddress, address attendanceAddress) Ownable(msg.sender) {
        rewardToken = IERC20(tokenAddress);
        attendanceContract = attendanceAddress;
    }

    function setAttendanceContract(address newAddress) external onlyOwner {
        attendanceContract = newAddress;
    }

    function airdrop(uint256 eventId, address[] calldata recipients, uint256 amount) external onlyOwner returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            bool verified = Attendance(attendanceContract).isVerifiedAttendee(eventId, recipients[i]);
            if (verified) {
                rewardToken.transfer(recipients[i], amount);
                total += amount;
                emit AirdropCompleted(eventId, recipients[i], amount);
            }
        }
        return total;
    }
}

interface Attendance {
    function isVerifiedAttendee(uint256 eventId, address attendee) external view returns (bool);
}
