// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract StakePassCore is ReentrancyGuard {
    uint256 public eventCount;
    uint256 public constant SPONSOR_REWARD_AMOUNT = 0.01 ether;

    struct Event {
        uint256 id;
        address organizer;
        uint256 depositAmount;
        uint256 totalStaked;
        uint256 noShowPool;
        bool isActive;
        uint256 checkedInCount;
        uint256 sponsorBudget;
        bool closed;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => bool)) public hasStaked;
    mapping(uint256 => mapping(address => bool)) public checkedIn;
    mapping(uint256 => address[]) private _attendees;
    mapping(uint256 => address[]) private _checkedInAttendees;
    mapping(uint256 => mapping(address => bool)) public sponsorTaskCompleted;
    mapping(uint256 => mapping(address => bool)) public sponsorRewardClaimed;

    event EventCreated(uint256 indexed eventId, address indexed organizer, uint256 depositAmount);
    event AttendeeRegistered(uint256 indexed eventId, address indexed attendee, uint256 amount);
    event AttendeeCheckedIn(uint256 indexed eventId, address indexed attendee, uint256 refundAmount);
    event SponsorDeposited(uint256 indexed eventId, address indexed sponsor, uint256 amount);
    event SponsorRewardClaimed(uint256 indexed eventId, address indexed attendee, uint256 amount);
    event EventClosed(uint256 indexed eventId, uint256 noShowPool, uint256 checkedInCount);

    function createEvent(uint256 _depositAmount) external returns (uint256) {
        require(_depositAmount > 0, 'Deposit must be positive');

        uint256 eventId = ++eventCount;
        events[eventId] = Event({
            id: eventId,
            organizer: msg.sender,
            depositAmount: _depositAmount,
            totalStaked: 0,
            noShowPool: 0,
            isActive: true,
            checkedInCount: 0,
            sponsorBudget: 0,
            closed: false
        });

        emit EventCreated(eventId, msg.sender, _depositAmount);
        return eventId;
    }

    function registerAndStake(uint256 _eventId) external payable nonReentrant {
        Event storage eventData = events[_eventId];
        require(eventData.id != 0, 'Event does not exist');
        require(eventData.isActive, 'Event is not active');
        require(!eventData.closed, 'Event is closed');
        require(msg.value == eventData.depositAmount, 'Incorrect deposit amount');
        require(!hasStaked[_eventId][msg.sender], 'Already registered');

        eventData.totalStaked += msg.value;
        eventData.noShowPool += msg.value;
        hasStaked[_eventId][msg.sender] = true;
        _attendees[_eventId].push(msg.sender);

        emit AttendeeRegistered(_eventId, msg.sender, msg.value);
    }

    function checkInAttendee(uint256 _eventId, address _attendee) external nonReentrant {
        Event storage eventData = events[_eventId];
        require(eventData.id != 0, 'Event does not exist');
        require(eventData.isActive, 'Event is not active');
        require(hasStaked[_eventId][_attendee], 'Attendee is not registered');
        require(!checkedIn[_eventId][_attendee], 'Already checked in');
        require(msg.sender == _attendee, 'Only the attendee can check in');

        uint256 refundAmount = eventData.depositAmount;
        checkedIn[_eventId][_attendee] = true;
        eventData.checkedInCount += 1;
        eventData.noShowPool -= refundAmount;
        _checkedInAttendees[_eventId].push(_attendee);

        (bool success, ) = payable(_attendee).call{ value: refundAmount }('');
        require(success, 'Refund transfer failed');

        emit AttendeeCheckedIn(_eventId, _attendee, refundAmount);
    }

    function sponsorDeposit(uint256 _eventId) external payable nonReentrant {
        Event storage eventData = events[_eventId];
        require(eventData.id != 0, 'Event does not exist');
        require(eventData.isActive, 'Event is not active');
        require(msg.value > 0, 'Deposit must be positive');

        eventData.sponsorBudget += msg.value;
        emit SponsorDeposited(_eventId, msg.sender, msg.value);
    }

    function markSponsorTaskCompleted(uint256 _eventId, address _attendee) external {
        Event storage eventData = events[_eventId];
        require(eventData.id != 0, 'Event does not exist');
        require(msg.sender == eventData.organizer, 'Only organizer');

        sponsorTaskCompleted[_eventId][_attendee] = true;
    }

    function claimSponsorReward(uint256 _eventId, address _attendee) external nonReentrant {
        Event storage eventData = events[_eventId];
        require(eventData.id != 0, 'Event does not exist');
        require(eventData.isActive, 'Event is not active');
        require(msg.sender == _attendee, 'Only attendee can claim');
        require(sponsorTaskCompleted[_eventId][_attendee], 'No sponsor task completed');
        require(!sponsorRewardClaimed[_eventId][_attendee], 'Already claimed');
        require(eventData.sponsorBudget >= SPONSOR_REWARD_AMOUNT, 'Sponsor budget exhausted');

        sponsorRewardClaimed[_eventId][_attendee] = true;
        eventData.sponsorBudget -= SPONSOR_REWARD_AMOUNT;

        (bool success, ) = payable(_attendee).call{ value: SPONSOR_REWARD_AMOUNT }('');
        require(success, 'Sponsor reward transfer failed');

        emit SponsorRewardClaimed(_eventId, _attendee, SPONSOR_REWARD_AMOUNT);
    }

    function closeEventAndDistributePool(uint256 _eventId) external nonReentrant {
        Event storage eventData = events[_eventId];
        require(eventData.id != 0, 'Event does not exist');
        require(eventData.isActive, 'Event already closed');
        require(msg.sender == eventData.organizer, 'Only organizer');

        uint256 poolAmount = eventData.noShowPool;
        uint256 checkedInCount = eventData.checkedInCount;
        eventData.isActive = false;
        eventData.closed = true;
        eventData.noShowPool = 0;

        if (checkedInCount == 0) {
            if (poolAmount > 0) {
                (bool success, ) = payable(eventData.organizer).call{ value: poolAmount }('');
                require(success, 'Pool transfer failed');
            }
            emit EventClosed(_eventId, poolAmount, 0);
            return;
        }

        uint256 share = poolAmount / checkedInCount;
        uint256 remainder = poolAmount % checkedInCount;

        for (uint256 i = 0; i < _checkedInAttendees[_eventId].length; i++) {
            address attendee = _checkedInAttendees[_eventId][i];
            if (!checkedIn[_eventId][attendee]) continue;

            uint256 amount = share;
            if (i == _checkedInAttendees[_eventId].length - 1 && remainder > 0) {
                amount += remainder;
            }

            if (amount > 0) {
                (bool success, ) = payable(attendee).call{ value: amount }('');
                require(success, 'Distribution transfer failed');
            }
        }

        emit EventClosed(_eventId, poolAmount, checkedInCount);
    }

    function getEvent(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }

    function getAttendeeCount(uint256 _eventId) external view returns (uint256) {
        return _attendees[_eventId].length;
    }

    function getCheckedInAttendees(uint256 _eventId) external view returns (address[] memory) {
        return _checkedInAttendees[_eventId];
    }
}
