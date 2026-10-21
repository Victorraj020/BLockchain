import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { DeadManSwitch, TestToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DeadManSwitch Contingency Vault", function () {
  let deadManSwitch: DeadManSwitch;
  let testToken: TestToken;
  let owner: SignerWithAddress;
  let beneficiary: SignerWithAddress;
  let otherUser: SignerWithAddress;
  let newBeneficiary: SignerWithAddress;

  const ONE_MINUTE = 60;
  const ONE_HOUR = 3600;
  const SEVEN_DAYS = 7 * 24 * 3600;
  const TOKEN_AMOUNT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, beneficiary, otherUser, newBeneficiary] = await ethers.getSigners();

    // Deploy TestToken
    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    testToken = await TestTokenFactory.deploy();
    await testToken.waitForDeployment();

    // Deploy DeadManSwitch
    const DeadManSwitchFactory = await ethers.getContractFactory("DeadManSwitch");
    deadManSwitch = await DeadManSwitchFactory.deploy();
    await deadManSwitch.waitForDeployment();

    // Mint tokens to owner and approve DeadManSwitch
    await testToken.mint(owner.address, ethers.parseEther("10000"));
    await testToken.connect(owner).approve(await deadManSwitch.getAddress(), ethers.parseEther("10000"));
  });

  // Scenario 1: A user can create a vault
  it("Scenario 1: A user can create a vault with valid parameters", async function () {
    const params = {
      name: "Personal Contingency Vault",
      description: "Emergency inheritance fund",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0, // TOKEN_TRANSFER
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "ipfs://QmDummyHash123",
    };

    const tx = await deadManSwitch.connect(owner).createVault(params);
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;

    const vault = await deadManSwitch.getVault(1);
    expect(vault.id).to.equal(1);
    expect(vault.owner).to.equal(owner.address);
    expect(vault.beneficiary).to.equal(beneficiary.address);
    expect(vault.name).to.equal("Personal Contingency Vault");
    expect(vault.checkInInterval).to.equal(ONE_MINUTE);
    expect(vault.tokenAmount).to.equal(TOKEN_AMOUNT);
    expect(vault.status).to.equal(0); // ACTIVE
  });

  // Scenario 2: An invalid beneficiary address is rejected
  it("Scenario 2: An invalid beneficiary address is rejected", async function () {
    // 2a: Zero address beneficiary rejected
    const paramsZero = {
      name: "Zero Beneficiary Vault",
      description: "Invalid",
      beneficiary: ethers.ZeroAddress,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await expect(
      deadManSwitch.connect(owner).createVault(paramsZero)
    ).to.be.revertedWith("Beneficiary cannot be zero address");

    // 2b: Self as beneficiary rejected
    const paramsSelf = {
      name: "Self Beneficiary Vault",
      description: "Invalid self",
      beneficiary: owner.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await expect(
      deadManSwitch.connect(owner).createVault(paramsSelf)
    ).to.be.revertedWith("Beneficiary cannot be the owner");
  });

  // Scenario 3: Only the owner can check in
  it("Scenario 3: Only the owner can check in", async function () {
    const params = {
      name: "Owner CheckIn Vault",
      description: "Testing access control",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);

    // Non-owner should be rejected
    await expect(
      deadManSwitch.connect(otherUser).checkIn(1)
    ).to.be.revertedWith("Caller is not the vault owner");

    // Beneficiary also cannot check-in (only the owner proves life)
    await expect(
      deadManSwitch.connect(beneficiary).checkIn(1)
    ).to.be.revertedWith("Caller is not the vault owner");

    // Owner check-in succeeds
    await expect(deadManSwitch.connect(owner).checkIn(1))
      .to.emit(deadManSwitch, "CheckedIn");
  });

  // Scenario 4: Check-in updates the last check-in timestamp
  it("Scenario 4: Check-in updates the last check-in timestamp and deadline", async function () {
    const params = {
      name: "Timestamp Vault",
      description: "Testing timestamp updates",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_HOUR,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);
    const vaultBefore = await deadManSwitch.getVault(1);
    const lastCheckInBefore = vaultBefore.lastCheckIn;

    // Advance time 30 minutes
    await time.increase(1800);

    // Perform check-in
    await deadManSwitch.connect(owner).checkIn(1);

    const vaultAfter = await deadManSwitch.getVault(1);
    expect(vaultAfter.lastCheckIn).to.be.greaterThan(lastCheckInBefore);

    const newDeadline = await deadManSwitch.getDeadline(1);
    expect(newDeadline).to.equal(vaultAfter.lastCheckIn + BigInt(ONE_HOUR));
  });

  // Scenario 5: Triggering before the deadline fails
  it("Scenario 5: Triggering before the deadline fails", async function () {
    const params = {
      name: "Early Trigger Vault",
      description: "Testing premature trigger rejection",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_HOUR,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);
    await deadManSwitch.connect(owner).depositTokens(1, TOKEN_AMOUNT);

    // Advance time partially (only 30 minutes out of 60 minutes)
    await time.increase(1800);

    // Not yet eligible
    const eligible = await deadManSwitch.isActionEligible(1);
    expect(eligible).to.be.false;

    // Attempt trigger should revert
    await expect(
      deadManSwitch.connect(beneficiary).triggerSwitch(1)
    ).to.be.revertedWith("Check-in deadline has not passed yet");
  });

  // Scenario 6: Triggering after the deadline succeeds
  it("Scenario 6: Triggering after the deadline succeeds", async function () {
    const params = {
      name: "Expired Deadline Vault",
      description: "Testing trigger after deadline",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);
    await deadManSwitch.connect(owner).depositTokens(1, TOKEN_AMOUNT);

    // Advance time past 60s
    await time.increase(65);

    // Vault should now report action eligible
    const eligible = await deadManSwitch.isActionEligible(1);
    expect(eligible).to.be.true;

    // Anyone or beneficiary can trigger
    await expect(deadManSwitch.connect(beneficiary).triggerSwitch(1))
      .to.emit(deadManSwitch, "SwitchTriggered")
      .and.to.emit(deadManSwitch, "ActionExecuted");

    const vault = await deadManSwitch.getVault(1);
    expect(vault.status).to.equal(1); // EXECUTED
  });

  // Scenario 7: The beneficiary receives the configured token amount
  it("Scenario 7: The beneficiary receives the configured token amount upon execution", async function () {
    const params = {
      name: "Token Handover Vault",
      description: "Testing beneficiary token receipt",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0, // TOKEN_TRANSFER
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);
    await deadManSwitch.connect(owner).depositTokens(1, TOKEN_AMOUNT);

    const beneficiaryBalanceBefore = await testToken.balanceOf(beneficiary.address);

    // Advance past deadline
    await time.increase(65);

    // Trigger switch
    await deadManSwitch.connect(otherUser).triggerSwitch(1);

    const beneficiaryBalanceAfter = await testToken.balanceOf(beneficiary.address);
    expect(beneficiaryBalanceAfter - beneficiaryBalanceBefore).to.equal(TOKEN_AMOUNT);
  });

  // Scenario 8: The switch cannot execute twice
  it("Scenario 8: The switch cannot execute twice", async function () {
    const params = {
      name: "Double Trigger Vault",
      description: "Testing double execution prevention",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);
    await deadManSwitch.connect(owner).depositTokens(1, TOKEN_AMOUNT);

    await time.increase(65);

    // First trigger succeeds
    await deadManSwitch.connect(beneficiary).triggerSwitch(1);

    // Second trigger attempt must revert
    await expect(
      deadManSwitch.connect(beneficiary).triggerSwitch(1)
    ).to.be.revertedWith("Vault is not active or already executed/cancelled");
  });

  // Scenario 9: A cancelled vault cannot execute
  it("Scenario 9: A cancelled vault cannot execute and refunds remaining tokens", async function () {
    const params = {
      name: "Cancellable Vault",
      description: "Testing cancellation and refund",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);
    await deadManSwitch.connect(owner).depositTokens(1, TOKEN_AMOUNT);

    const ownerBalanceBefore = await testToken.balanceOf(owner.address);

    // Owner cancels vault
    await expect(deadManSwitch.connect(owner).cancelVault(1))
      .to.emit(deadManSwitch, "VaultCancelled")
      .withArgs(1, owner.address, TOKEN_AMOUNT);

    const ownerBalanceAfter = await testToken.balanceOf(owner.address);
    expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(TOKEN_AMOUNT);

    const vault = await deadManSwitch.getVault(1);
    expect(vault.status).to.equal(2); // CANCELLED

    // Fast-forward time past deadline
    await time.increase(100);

    // Triggering must revert
    await expect(
      deadManSwitch.connect(beneficiary).triggerSwitch(1)
    ).to.be.revertedWith("Vault is not active or already executed/cancelled");
  });

  // Scenario 10: Unauthorized users cannot change protected configuration
  it("Scenario 10: Unauthorized users cannot change protected configuration", async function () {
    const params = {
      name: "Protected Config Vault",
      description: "Testing unauthorized modifications",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);

    // Non-owner cannot update beneficiary
    await expect(
      deadManSwitch.connect(otherUser).updateBeneficiary(1, newBeneficiary.address)
    ).to.be.revertedWith("Caller is not the vault owner");

    // Non-owner cannot cancel vault
    await expect(
      deadManSwitch.connect(otherUser).cancelVault(1)
    ).to.be.revertedWith("Caller is not the vault owner");

    // Owner can successfully update beneficiary
    await expect(
      deadManSwitch.connect(owner).updateBeneficiary(1, newBeneficiary.address)
    )
      .to.emit(deadManSwitch, "BeneficiaryUpdated")
      .withArgs(1, beneficiary.address, newBeneficiary.address);

    const updatedVault = await deadManSwitch.getVault(1);
    expect(updatedVault.beneficiary).to.equal(newBeneficiary.address);
  });

  // Scenario 11: Token funding and allowance failures are handled correctly
  it("Scenario 11: Token funding and allowance failures are handled correctly", async function () {
    const params = {
      name: "Allowance Test Vault",
      description: "Testing allowance boundaries",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: TOKEN_AMOUNT,
      payloadHash: "",
    };

    await deadManSwitch.connect(owner).createVault(params);

    // otherUser has no tokens and no allowance
    await expect(
      deadManSwitch.connect(otherUser).depositTokens(1, TOKEN_AMOUNT)
    ).to.be.reverted; // ERC20 insufficient allowance / balance

    // Owner cannot deposit 0
    await expect(
      deadManSwitch.connect(owner).depositTokens(1, 0)
    ).to.be.revertedWith("Deposit amount must be greater than zero");

    // If vault is not funded with required amount, trigger fails
    await time.increase(65);
    await expect(
      deadManSwitch.connect(beneficiary).triggerSwitch(1)
    ).to.be.revertedWith("Insufficient deposited tokens to fulfill action");
  });

  // Scenario 12: Multiple vaults can exist without interfering with each other
  it("Scenario 12: Multiple vaults can exist without interfering with each other", async function () {
    // Vault 1: 1-minute interval owned by `owner`
    const params1 = {
      name: "Vault One",
      description: "First independent vault",
      beneficiary: beneficiary.address,
      checkInInterval: ONE_MINUTE,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: ethers.parseEther("10"),
      payloadHash: "",
    };
    await deadManSwitch.connect(owner).createVault(params1);
    await deadManSwitch.connect(owner).depositTokens(1, ethers.parseEther("10"));

    // Vault 2: 7-day interval owned by `otherUser`
    await testToken.mint(otherUser.address, ethers.parseEther("500"));
    await testToken.connect(otherUser).approve(await deadManSwitch.getAddress(), ethers.parseEther("500"));

    const params2 = {
      name: "Vault Two",
      description: "Second independent vault",
      beneficiary: newBeneficiary.address,
      checkInInterval: SEVEN_DAYS,
      actionType: 0,
      tokenAddress: await testToken.getAddress(),
      tokenAmount: ethers.parseEther("50"),
      payloadHash: "",
    };
    await deadManSwitch.connect(otherUser).createVault(params2);
    await deadManSwitch.connect(otherUser).depositTokens(2, ethers.parseEther("50"));

    expect(await deadManSwitch.getVaultCount()).to.equal(2);

    // Check user vaults
    const ownerVaults = await deadManSwitch.getUserVaults(owner.address);
    expect(ownerVaults.length).to.equal(1);
    expect(ownerVaults[0]).to.equal(1);

    const otherVaults = await deadManSwitch.getUserVaults(otherUser.address);
    expect(otherVaults.length).to.equal(1);
    expect(otherVaults[0]).to.equal(2);

    // Fast forward 65 seconds: Vault 1 is eligible, Vault 2 is NOT eligible
    await time.increase(65);

    expect(await deadManSwitch.isActionEligible(1)).to.be.true;
    expect(await deadManSwitch.isActionEligible(2)).to.be.false;

    // Trigger Vault 1
    await deadManSwitch.connect(beneficiary).triggerSwitch(1);
    expect((await deadManSwitch.getVault(1)).status).to.equal(1); // EXECUTED

    // Vault 2 remains ACTIVE and unaffected
    expect((await deadManSwitch.getVault(2)).status).to.equal(0); // ACTIVE
    expect((await deadManSwitch.getVault(2)).depositedAmount).to.equal(ethers.parseEther("50"));

    // Other user can still check in on Vault 2
    await expect(deadManSwitch.connect(otherUser).checkIn(2))
      .to.emit(deadManSwitch, "CheckedIn");
  });

  // Bonus Scenario: Faucet functionality in TestToken
  it("Bonus: TestToken faucet allows claiming 1,000 TEST with cooldown", async function () {
    const claimer = otherUser;
    const initialBalance = await testToken.balanceOf(claimer.address);

    await expect(testToken.connect(claimer).faucet(claimer.address))
      .to.emit(testToken, "FaucetClaimed")
      .withArgs(claimer.address, ethers.parseEther("1000"));

    const afterBalance = await testToken.balanceOf(claimer.address);
    expect(afterBalance - initialBalance).to.equal(ethers.parseEther("1000"));

    // Attempting immediately reverts due to cooldown
    await expect(
      testToken.connect(claimer).faucet(claimer.address)
    ).to.be.revertedWith("Faucet cooldown active. Please wait 1 minute.");

    // Advance 60s
    await time.increase(61);

    // Second claim succeeds
    await expect(testToken.connect(claimer).faucet(claimer.address))
      .to.emit(testToken, "FaucetClaimed");
  });
});
