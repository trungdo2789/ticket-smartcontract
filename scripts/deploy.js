// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ticketPrice = ethers.parseEther("0.001"); // 0.1 ETH
  const ticketsPerPurchase = 10;

  console.log("Ticket Price:", ticketPrice.toString());
  console.log("Tickets Per Purchase:", ticketsPerPurchase);

  const Ticket = await ethers.getContractFactory("Ticket");
  const ticket = await Ticket.deploy(ticketPrice, ticketsPerPurchase);

  console.log("Ticket contract deployed to:", await ticket.getAddress());

  // Verify the contract on Etherscan (optional)
  if (network.name === "mainnet") {
    await hre.run("verify:verify", {
      address: ticket.address,
      constructorArguments: [ticketPrice, ticketsPerPurchase],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });