// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';

contract Attendance is Ownable {
    struct AttendeeRecord {
        bool registered;
        bool checkedIn;
        bool rewarded;
        uint256 checkedInAt;
    }

    mapping(uint256 => mapping(address => AttendeeRecord)) public attendance;
    mapping(uint256 => address[]) public attendeeList;
    mapping(uint256 => mapping(address => bool)) public registered;

    event Registered(uint256 indexed eventId, address indexed attendee);
    event CheckedIn(uint256 indexed eventId, address indexed attendee, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function registerAttendee(uint256 eventId, address attendee) external onlyOwner {
        require(!registered[eventId][attendee], 'Already registered');
        registered[eventId][attendee] = true;
        attendance[eventId][attendee].registered = true;
        attendeeList[eventId].push(attendee);
        emit Registered(eventId, attendee);
    }

    function checkIn(uint256 eventId, address attendee) external onlyOwner {
        require(registered[eventId][attendee], 'Not registered');
        require(!attendance[eventId][attendee].checkedIn, 'Already checked in');
        attendance[eventId][attendee].checkedIn = true;
        attendance[eventId][attendee].checkedInAt = block.timestamp;
        emit CheckedIn(eventId, attendee, block.timestamp);
    }

    function markRewarded(uint256 eventId, address attendee) external onlyOwner {
        attendance[eventId][attendee].rewarded = true;
    }

    function isVerifiedAttendee(uint256 eventId, address attendee) external view returns (bool) {
        return attendance[eventId][attendee].registered && attendance[eventId][attendee].checkedIn;
    }

    function getAttendees(uint256 eventId) external view returns (address[] memory) {
        return attendeeList[eventId];
    }
}
