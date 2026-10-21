import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\n========================================`);
  console.log(`Deploying contracts with account: ${deployer.address}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId || 31337})`);
  console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`========================================\n`);

  // 1. Deploy TestToken
  console.log("1. Deploying TestToken (TEST)...");
  const TestTokenFactory = await ethers.getContractFactory("TestToken");
  const testToken = await TestTokenFactory.deploy();
  await testToken.waitForDeployment();
  const testTokenAddress = await testToken.getAddress();
  console.log(`   TestToken deployed at: ${testTokenAddress}`);

  // 2. Deploy DeadManSwitch
  console.log("2. Deploying DeadManSwitch...");
  const DeadManSwitchFactory = await ethers.getContractFactory("DeadManSwitch");
  const deadManSwitch = await DeadManSwitchFactory.deploy();
  await deadManSwitch.waitForDeployment();
  const deadManSwitchAddress = await deadManSwitch.getAddress();
  console.log(`   DeadManSwitch deployed at: ${deadManSwitchAddress}`);

  // 3. For localhost development: setup demo vault
  if (network.name === "localhost" || network.name === "hardhat") {
    console.log("3. Setting up demo contingency vault for local testing...");
    const signers = await ethers.getSigners();
    const beneficiary = signers.length > 1 ? signers[1] : deployer;

    // Approve DeadManSwitch to spend 500 TEST
    const depositAmount = ethers.parseEther("100");
    await testToken.approve(deadManSwitchAddress, ethers.parseEther("500"));

    // Create 1-minute demo vault
    const demoParams = {
      name: "Alpha Contingency Vault",
      description: "Local demo vault with 60s trigger interval for live testing",
      beneficiary: beneficiary.address,
      checkInInterval: 60, // 60 seconds for quick testing!
      actionType: 0, // TOKEN_TRANSFER
      tokenAddress: testTokenAddress,
      tokenAmount: depositAmount,
      payloadHash: "ipfs://QmLocalDemoContingencyPayloadHash",
    };

    const tx = await deadManSwitch.createVault(demoParams);
    await tx.wait();
    console.log(`   Demo vault #1 created! Owner: ${deployer.address}, Beneficiary: ${beneficiary.address}`);

    // Fund the demo vault with 100 TEST
    const fundTx = await deadManSwitch.depositTokens(1, depositAmount);
    await fundTx.wait();
    console.log(`   Demo vault #1 funded with 100 TEST!`);

    // Fund the secondary account with 1,000 TEST for testing
    if (signers.length > 1) {
      await testToken.mint(signers[1].address, ethers.parseEther("1000"));
      console.log(`   Funded account #2 (${signers[1].address}) with 1,000 TEST tokens`);
    }
  }

  // 4. Export configuration and ABIs to frontend directory
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const deploymentData = {
    network: network.name,
    chainId: network.config.chainId || 31337,
    deployedAt: new Date().toISOString(),
    contracts: {
      TestToken: {
        address: testTokenAddress,
      },
      DeadManSwitch: {
        address: deadManSwitchAddress,
      },
    },
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "deployedAddresses.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Copy ABIs
  const testTokenArtifact = await ethers.getContractFactory("TestToken");
  const deadManSwitchArtifact = await ethers.getContractFactory("DeadManSwitch");

  fs.writeFileSync(
    path.join(frontendContractsDir, "TestTokenABI.json"),
    JSON.stringify(testTokenArtifact.interface.formatJson(), null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDir, "DeadManSwitchABI.json"),
    JSON.stringify(deadManSwitchArtifact.interface.formatJson(), null, 2)
  );

  console.log(`\nDeployment details and ABIs exported to frontend/src/contracts/`);
  console.log(`========================================`);
  console.log(`Deployment complete!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
