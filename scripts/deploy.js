const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy AgentToken
  const AgentToken = await hre.ethers.deployContract("AgentToken");
  await AgentToken.waitForDeployment();
  const agentTokenAddress = await AgentToken.getAddress();
  console.log("AgentToken deployed to:", agentTokenAddress);

  // Deploy JobMarket with AgentToken address as constructor arg
  const JobMarket = await hre.ethers.deployContract("JobMarket", [agentTokenAddress]);
  await JobMarket.waitForDeployment();
  const jobMarketAddress = await JobMarket.getAddress();
  console.log("JobMarket deployed to:", jobMarketAddress);

  // Save contract addresses
  const data = {
    AgentToken: agentTokenAddress,
    JobMarket: jobMarketAddress,
  };

  fs.writeFileSync("deployed.json", JSON.stringify(data, null, 2));
  console.log("Contract addresses saved to deployed.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
