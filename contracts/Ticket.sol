// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Ticket {
    address public owner;
    mapping(address => uint256) public ticketBalances;
    uint256 public ticketPrice;
    uint256 public ticketsPerPurchase;

    event TicketsPurchased(address indexed buyer, uint256 numberOfTickets);
    event UpdateConfig(uint256 ticketPrice, uint256 ticketsPerPurchase);

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

    function buyTickets() public payable {
        uint256 totalCost = ticketsPerPurchase * ticketPrice;
        require(
            msg.value >= totalCost,
            "Insufficient ETH sent to purchase the tickets"
        );
        ticketBalances[msg.sender] += ticketsPerPurchase;
         if (msg.value > totalCost) {
            // Refund any excess ETH sent
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        emit TicketsPurchased(msg.sender, ticketsPerPurchase);
    }

    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Allow the owner to update the ticket price and the maximum number of tickets per purchase
    function updateTicketDetails(
        uint256 _newTicketPrice,
        uint256 _newTicketsPerPurchase
    ) public onlyOwner {
        ticketPrice = _newTicketPrice;
        ticketsPerPurchase = _newTicketsPerPurchase;
        emit UpdateConfig(_newTicketPrice, _newTicketsPerPurchase);
    }
}
