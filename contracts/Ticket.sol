// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Ticket {
    address public owner;
    mapping(address => uint256) public ticketBalances;
    uint256 public ticketPrice;
    uint256 public ticketsPerPurchase;

    struct Season {
        uint256 id;
        uint256 startAt;
        uint256 endAt;
    }
    Season[] public seasons;
    event TicketsPurchased(address indexed buyer, uint256 numberOfTickets);
    event UpdateConfig(uint256 ticketPrice, uint256 ticketsPerPurchase);
    event SeasonCreated(uint256 seasonId, uint256 startAt, uint256 endAt);

    constructor(
        uint256 _initialTicketPrice,
        uint256 _initialTicketsPerPurchase
    ) {
        owner = msg.sender;
        ticketPrice = _initialTicketPrice;
        ticketsPerPurchase = _initialTicketsPerPurchase;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function createSeason(uint256 _startAt, uint256 _endAt) public onlyOwner {
        require(_endAt > _startAt, "Invalid season dates");
        uint256 seasonId = seasons.length;
        seasons.push(Season(seasonId, _startAt, _endAt));
        emit SeasonCreated(seasonId, _startAt, _endAt);
    }

    function buyTickets() public payable {
        uint256 totalCost = ticketsPerPurchase * ticketPrice;
        require(
            msg.value >= totalCost,
            "Insufficient ETH sent to purchase the tickets"
        );
        ticketBalances[msg.sender] += ticketsPerPurchase;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        emit TicketsPurchased(msg.sender, ticketsPerPurchase);
    }

    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function updateTicketDetails(
        uint256 _newTicketPrice,
        uint256 _newTicketsPerPurchase
    ) public onlyOwner {
        ticketPrice = _newTicketPrice;
        ticketsPerPurchase = _newTicketsPerPurchase;
        emit UpdateConfig(_newTicketPrice, _newTicketsPerPurchase);
    }
}
