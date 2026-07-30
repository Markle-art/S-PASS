// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';

contract EventRegistry is Ownable {
    struct EventData {
        address organizer;
        string title;
        string description;
        string location;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 rewardAmount;
    }

    uint256 public eventCount;
    mapping(uint256 => EventData) public events;

    event EventCreated(uint256 indexed eventId, address indexed organizer, string title);

    constructor() Ownable(msg.sender) {}

    function createEvent(
        string calldata title,
        string calldata description,
        string calldata location,
        uint256 startTime,
        uint256 endTime,
        uint256 rewardAmount
    ) external returns (uint256) {
        require(startTime < endTime, 'Invalid time range');
        uint256 eventId = ++eventCount;
        events[eventId] = EventData({
            organizer: msg.sender,
            title: title,
            description: description,
            location: location,
            startTime: startTime,
            endTime: endTime,
            active: true,
            rewardAmount: rewardAmount
        });
        emit EventCreated(eventId, msg.sender, title);
        return eventId;
    }

    function getEvent(uint256 eventId) external view returns (EventData memory) {
        return events[eventId];
    }

    function toggleEventStatus(uint256 eventId) external {
        require(events[eventId].organizer == msg.sender, 'Only organizer');
        events[eventId].active = !events[eventId].active;
    }
}
