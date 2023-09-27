const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Ticket", function () {
  let Ticket;
  let ticket;
  let owner;
  let user1;
  let contractAddress;

  const ticketPrice = ethers.parseEther("0.01"); // 0.01 ETH
  const ticketsPerBulk = 50; // Number of tickets per bulk purchase
  const bulkDiscount5 = 10; // 10% discount for 5 bulk purchases
  const bulkDiscount10 = 20; // 20% discount for 10 bulk purchases
  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();
    // Deploy the contract with initial values
    Ticket = await ethers.getContractFactory("Ticket");
    ticket = await Ticket.deploy();
    contractAddress = await ticket.getAddress();
  });

  it("should allow users to purchase tickets", async function () {
    const numberOfLotBuy = 1;
    const numberOfTicketsToPurchase = ticketsPerBulk * numberOfLotBuy;
    const totalCost = ticketPrice * ethers.toBigInt(numberOfLotBuy);

    // User1 calls buyTickets function
    await expect(ticket.connect(user1).buyTickets({ value: totalCost }))
      .to.emit(ticket, "TicketsPurchased")
      .withArgs(user1.address, numberOfTicketsToPurchase, totalCost);

    const user1Balance = await ticket.ticketBalances(user1.address);
    expect(user1Balance).to.equal(numberOfTicketsToPurchase);
  });

  it("should prevent users from purchasing less than the specified minimum tickets", async function () {
    const totalCost = 0;

    // User1 attempts to call buyTickets with too many tickets
    await expect(
      ticket.connect(user1).buyTickets({ value: totalCost })
    ).to.be.revertedWith("You must buy at least one lot");
  });

  it("should discount when buy 5 lot", async () => {
    const numberOfLotBuy = 5;
    const numberOfTicketsToPurchase = ticketsPerBulk * numberOfLotBuy;
    const totalCost = ticketPrice * ethers.toBigInt(numberOfLotBuy);
    const discount5 = totalCost * ethers.toBigInt(bulkDiscount5) / ethers.toBigInt(100);
    const afterDiscountCost = totalCost - discount5;
    // User1 calls buyTickets function
    await expect(ticket.connect(user1).buyTickets({ value: totalCost }))
      .to.emit(ticket, "TicketsPurchased")
      .withArgs(user1.address, numberOfTicketsToPurchase, afterDiscountCost);

    const user1Balance = await ticket.ticketBalances(user1.address);
    expect(user1Balance).to.equal(numberOfTicketsToPurchase);
  })

  it("should discount when buy 10 lot", async () => {
    const numberOfLotBuy = 10;
    const numberOfTicketsToPurchase = ticketsPerBulk * numberOfLotBuy;
    const totalCost = ticketPrice * ethers.toBigInt(numberOfLotBuy);
    const discount10 = totalCost * ethers.toBigInt(bulkDiscount10) / ethers.toBigInt(100);
    const afterDiscountCost = totalCost - discount10;
    // User1 calls buyTickets function
    await expect(ticket.connect(user1).buyTickets({ value: totalCost }))
      .to.emit(ticket, "TicketsPurchased")
      .withArgs(user1.address, numberOfTicketsToPurchase, afterDiscountCost);

    const user1Balance = await ticket.ticketBalances(user1.address);
    expect(user1Balance).to.equal(numberOfTicketsToPurchase);
  })

  it("should allow the owner to update ticket details", async function () {
    const newTicketLotPrice = ethers.parseEther("0.02"); // New ticket price
    const newTicketsPerBulk = 60; // New tickets per purchase
    const newBulkDiscount5 = 6;
    const newBulkDiscount10 = 11;

    await ticket.UpdateConfig(newTicketLotPrice, newTicketsPerBulk, newBulkDiscount5, newBulkDiscount10);

    const updatedTicketPrice = await ticket.ticketLotPrice();
    const updatedTicketsPerPurchase = await ticket.ticketsPerBulk();
    const updatedDiscount5 = await ticket.bulkDiscount5();
    const updatedDiscount10 = await ticket.bulkDiscount10();

    expect(updatedTicketPrice).to.equal(newTicketLotPrice);
    expect(updatedTicketsPerPurchase).to.equal(newTicketsPerBulk);
    expect(updatedDiscount5).to.equal(newBulkDiscount5);
    expect(updatedDiscount10).to.equal(newBulkDiscount10);
  });
});