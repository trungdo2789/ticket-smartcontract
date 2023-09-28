// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Ticket {
    address public owner;
    mapping(address => uint256) public ticketBalances;
    uint256 public ticketLotPrice = 0.01 ether;
    uint256 public ticketsPerBulk = 50; // Number of tickets per bulk purchase
    uint256 public bulkDiscount5 = 10; // 10% discount for 5 bulk purchases
    uint256 public bulkDiscount10 = 20; // 20% discount for 10 bulk purchases

    event TicketsPurchased(
        address indexed buyer,
        uint256 numberOfTickets,
        uint256 cost
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function getCost(uint256 numberOfLotToBuy) public view returns (uint256) {
        uint256 totalCost = numberOfLotToBuy * ticketLotPrice;
        uint256 discount = 0;
        // Apply discounts based on the number of bulk purchases
        if (numberOfLotToBuy >= 10) {
            // 20% discount for 10 bulk purchases
            discount = (totalCost * bulkDiscount10) / 100;
        } else if (numberOfLotToBuy >= 5) {
            // 10% discount for 5 bulk purchases
            discount = (totalCost * bulkDiscount5) / 100;
        }
        totalCost -= discount;
        return totalCost;
    }

    function buyTickets() public payable {
        uint256 numberOfLotToBuy = msg.value / ticketLotPrice;
        uint256 numberOfTicketsToBuy = numberOfLotToBuy * ticketsPerBulk;

        require(numberOfLotToBuy > 0, "You must buy at least one lot");

        uint256 totalCost = getCost(numberOfLotToBuy);

        require(
            msg.value >= totalCost,
            "Insufficient ETH sent to purchase the tickets"
        );

        ticketBalances[msg.sender] += numberOfTicketsToBuy;

        if (msg.value > totalCost) {
            // Refund any excess ETH sent
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit TicketsPurchased(msg.sender, numberOfTicketsToBuy, totalCost);
    }

    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Allow the owner to update the ticket price, number of tickets per bulk, and discounts
    function UpdateConfig(
        uint256 _newTicketLotPrice,
        uint256 _newTicketsPerBulk,
        uint256 _newBulkDiscount5,
        uint256 _newBulkDiscount10
    ) public onlyOwner {
        ticketLotPrice = _newTicketLotPrice;
        ticketsPerBulk = _newTicketsPerBulk;
        bulkDiscount5 = _newBulkDiscount5;
        bulkDiscount10 = _newBulkDiscount10;
    }
}
