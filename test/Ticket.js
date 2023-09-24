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

  const ticketPrice = ethers.parseEther("0.01"); // 0.1 ETH
  const ticketsPerPurchase = 5;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    // Deploy the contract with initial values
    Ticket = await ethers.getContractFactory("Ticket");
    ticket = await Ticket.deploy(ticketPrice, ticketsPerPurchase);
    contractAddress = await ticket.getAddress();
  });

  it("should allow users to purchase tickets", async function () {
    const numberOfTicketsToPurchase = ticketsPerPurchase;
    const totalCost = ticketPrice * ethers.toBigInt(numberOfTicketsToPurchase);

    // User1 calls buyTickets function
    await expect(ticket.connect(user1).buyTickets({ value: totalCost }))
      .to.emit(ticket, "TicketsPurchased")
      .withArgs(user1.address, numberOfTicketsToPurchase);

    const user1Balance = await ticket.ticketBalances(user1.address);
    expect(user1Balance).to.equal(numberOfTicketsToPurchase);
  });

  it("should prevent users from purchasing less than the specified minimum tickets", async function () {
    const numberOfTicketsToPurchase = ticketsPerPurchase - 1; // Exceed the minimum
    const totalCost = ticketPrice * ethers.toBigInt(numberOfTicketsToPurchase);

    // User1 attempts to call buyTickets with too many tickets
    await expect(
      ticket.connect(user1).buyTickets({ value: totalCost })
    ).to.be.revertedWith("Insufficient ETH sent to purchase the tickets");
  });

  it("should allow the owner to update ticket details", async function () {
    const newTicketPrice = ethers.parseEther("0.01"); // New ticket price
    const newTicketsPerPurchase = 50; // New tickets per purchase

    await expect(ticket.updateTicketDetails(newTicketPrice, newTicketsPerPurchase))
      .to.emit(ticket, "UpdateConfig")
      .withArgs(newTicketPrice, newTicketsPerPurchase);

    const updatedTicketPrice = await ticket.ticketPrice();
    const updatedTicketsPerPurchase = await ticket.ticketsPerPurchase();

    expect(updatedTicketPrice).to.equal(newTicketPrice);
    expect(updatedTicketsPerPurchase).to.equal(newTicketsPerPurchase);
  });
});