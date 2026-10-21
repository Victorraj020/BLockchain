// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DeadManSwitch
 * @notice Blockchain-based digital contingency vault for asset and secret handover.
 * Allows users to set check-in intervals, designate beneficiaries, and release assets
 * or encrypted instructions if check-ins lapse past the designated deadline.
 */
contract DeadManSwitch is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum ActionType {
        TOKEN_TRANSFER,       // Handover ERC-20 test tokens
        ENCRYPTED_MESSAGE,    // Handover encrypted key/message reference
        ENCRYPTED_DOCUMENT    // Handover encrypted document reference
    }

    enum VaultStatus {
        ACTIVE,     // Vault is active, awaiting owner check-ins
        EXECUTED,   // Deadline passed and action has been successfully triggered
        CANCELLED   // Vault cancelled by owner, remaining funds refunded
    }

    struct Vault {
        uint256 id;
        address owner;
        address beneficiary;
        string name;
        string description;
        uint256 checkInInterval; // Duration in seconds (e.g. 60 for 1m demo, 604800 for 7d)
        uint256 lastCheckIn;     // Unix timestamp of last check-in
        ActionType actionType;
        address tokenAddress;    // Address of ERC-20 token (if TOKEN_TRANSFER)
        uint256 tokenAmount;     // Target payout amount for beneficiary
        uint256 depositedAmount; // Actual tokens currently locked in this vault
        string payloadHash;      // IPFS/Arweave CID or encrypted secret pointer
        VaultStatus status;
        uint256 createdAt;
        uint256 executedAt;
    }

    // State variables
    uint256 private _vaultIdCounter;
    mapping(uint256 => Vault) private _vaults;
    mapping(address => uint256[]) private _userVaults;
    mapping(address => uint256[]) private _beneficiaryVaults;

    // Minimum check-in interval: 60 seconds (useful for testing and demo)
    uint256 public constant MIN_INTERVAL = 60 seconds;

    // Events
    struct CreateVaultParams {
        string name;
        string description;
        address beneficiary;
        uint256 checkInInterval;
        ActionType actionType;
        address tokenAddress;
        uint256 tokenAmount;
        string payloadHash;
    }

    event VaultCreated(
        uint256 indexed vaultId,
        address indexed owner,
        address indexed beneficiary,
        uint256 checkInInterval,
        ActionType actionType,
        uint256 tokenAmount,
        uint256 deadline
    );

    event VaultFunded(
        uint256 indexed vaultId,
        address indexed funder,
        uint256 amountFunded,
        uint256 totalDeposited
    );

    event CheckedIn(
        uint256 indexed vaultId,
        address indexed owner,
        uint256 timestamp,
        uint256 newDeadline
    );

    event BeneficiaryUpdated(
        uint256 indexed vaultId,
        address indexed oldBeneficiary,
        address indexed newBeneficiary
    );

    event SwitchTriggered(
        uint256 indexed vaultId,
        address indexed caller,
        uint256 timestamp
    );

    event ActionExecuted(
        uint256 indexed vaultId,
        ActionType actionType,
        address indexed beneficiary,
        uint256 amountTransferred,
        string payloadHash
    );

    event VaultCancelled(
        uint256 indexed vaultId,
        address indexed owner,
        uint256 refundAmount
    );

    // Modifiers
    modifier onlyVaultOwner(uint256 vaultId) {
        require(_vaults[vaultId].id != 0, "Vault does not exist");
        require(_vaults[vaultId].owner == msg.sender, "Caller is not the vault owner");
        _;
    }

    modifier vaultExists(uint256 vaultId) {
        require(_vaults[vaultId].id != 0, "Vault does not exist");
        _;
    }

    /**
     * @notice Create a new contingency vault.
     * @param params Configuration parameters struct for vault creation.
     */
    function createVault(
        CreateVaultParams calldata params
    ) external returns (uint256) {
        require(bytes(params.name).length > 0, "Vault name is required");
        require(params.beneficiary != address(0), "Beneficiary cannot be zero address");
        require(params.beneficiary != msg.sender, "Beneficiary cannot be the owner");
        require(params.checkInInterval >= MIN_INTERVAL, "Interval must be at least 60 seconds");

        if (params.actionType == ActionType.TOKEN_TRANSFER) {
            require(params.tokenAddress != address(0), "Token address required for transfer action");
            require(params.tokenAmount > 0, "Token amount must be greater than zero");
        }

        _vaultIdCounter++;
        uint256 newVaultId = _vaultIdCounter;
        uint256 currentTime = block.timestamp;

        Vault storage vault = _vaults[newVaultId];
        vault.id = newVaultId;
        vault.owner = msg.sender;
        vault.beneficiary = params.beneficiary;
        vault.name = params.name;
        vault.description = params.description;
        vault.checkInInterval = params.checkInInterval;
        vault.lastCheckIn = currentTime;
        vault.actionType = params.actionType;
        vault.tokenAddress = params.tokenAddress;
        vault.tokenAmount = params.tokenAmount;
        vault.depositedAmount = 0;
        vault.payloadHash = params.payloadHash;
        vault.status = VaultStatus.ACTIVE;
        vault.createdAt = currentTime;
        vault.executedAt = 0;

        _userVaults[msg.sender].push(newVaultId);
        _beneficiaryVaults[params.beneficiary].push(newVaultId);

        uint256 initialDeadline = currentTime + params.checkInInterval;

        emit VaultCreated(
            newVaultId,
            msg.sender,
            params.beneficiary,
            params.checkInInterval,
            params.actionType,
            params.tokenAmount,
            initialDeadline
        );

        return newVaultId;
    }

    /**
     * @notice Deposit ERC-20 tokens into a vault.
     * Caller must have approved this contract for at least `amount` tokens.
     */
    function depositTokens(uint256 vaultId, uint256 amount)
        external
        nonReentrant
        vaultExists(vaultId)
    {
        Vault storage vault = _vaults[vaultId];
        require(vault.status == VaultStatus.ACTIVE, "Vault is not active");
        require(vault.actionType == ActionType.TOKEN_TRANSFER, "Vault does not support token transfers");
        require(amount > 0, "Deposit amount must be greater than zero");

        vault.depositedAmount += amount;

        IERC20(vault.tokenAddress).safeTransferFrom(msg.sender, address(this), amount);

        emit VaultFunded(vaultId, msg.sender, amount, vault.depositedAmount);
    }

    /**
     * @notice Performs a proof-of-life check-in for a vault. Resets the deadline.
     * Can only be called by the vault owner while active.
     */
    function checkIn(uint256 vaultId)
        external
        onlyVaultOwner(vaultId)
    {
        Vault storage vault = _vaults[vaultId];
        require(vault.status == VaultStatus.ACTIVE, "Vault is not active");

        vault.lastCheckIn = block.timestamp;
        uint256 newDeadline = block.timestamp + vault.checkInInterval;

        emit CheckedIn(vaultId, msg.sender, block.timestamp, newDeadline);
    }

    /**
     * @notice Triggers the contingency switch if the deadline has elapsed.
     * Can be called by any wallet (e.g. beneficiary, guardian, or keeper).
     * The contract autonomously validates whether deadline has passed.
     */
    function triggerSwitch(uint256 vaultId)
        external
        nonReentrant
        vaultExists(vaultId)
    {
        Vault storage vault = _vaults[vaultId];
        require(vault.status == VaultStatus.ACTIVE, "Vault is not active or already executed/cancelled");

        uint256 deadline = vault.lastCheckIn + vault.checkInInterval;
        require(block.timestamp > deadline, "Check-in deadline has not passed yet");

        vault.status = VaultStatus.EXECUTED;
        vault.executedAt = block.timestamp;

        emit SwitchTriggered(vaultId, msg.sender, block.timestamp);

        if (vault.actionType == ActionType.TOKEN_TRANSFER) {
            require(vault.depositedAmount >= vault.tokenAmount, "Insufficient deposited tokens to fulfill action");
            uint256 transferAmount = vault.tokenAmount;
            vault.depositedAmount -= transferAmount;

            IERC20(vault.tokenAddress).safeTransfer(vault.beneficiary, transferAmount);

            emit ActionExecuted(
                vaultId,
                vault.actionType,
                vault.beneficiary,
                transferAmount,
                vault.payloadHash
            );
        } else {
            // For encrypted message or document handover
            emit ActionExecuted(
                vaultId,
                vault.actionType,
                vault.beneficiary,
                0,
                vault.payloadHash
            );
        }
    }

    /**
     * @notice Cancels an active vault and returns all deposited tokens to the owner.
     */
    function cancelVault(uint256 vaultId)
        external
        nonReentrant
        onlyVaultOwner(vaultId)
    {
        Vault storage vault = _vaults[vaultId];
        require(vault.status == VaultStatus.ACTIVE, "Cannot cancel vault: not active");

        vault.status = VaultStatus.CANCELLED;
        uint256 refundAmount = vault.depositedAmount;

        if (refundAmount > 0 && vault.tokenAddress != address(0)) {
            vault.depositedAmount = 0;
            IERC20(vault.tokenAddress).safeTransfer(vault.owner, refundAmount);
        }

        emit VaultCancelled(vaultId, msg.sender, refundAmount);
    }

    /**
     * @notice Updates the designated beneficiary address.
     * Only the owner can update this while the vault is active.
     */
    function updateBeneficiary(uint256 vaultId, address newBeneficiary)
        external
        onlyVaultOwner(vaultId)
    {
        Vault storage vault = _vaults[vaultId];
        require(vault.status == VaultStatus.ACTIVE, "Vault is not active");
        require(newBeneficiary != address(0), "Beneficiary cannot be zero address");
        require(newBeneficiary != msg.sender, "Beneficiary cannot be owner");
        require(newBeneficiary != vault.beneficiary, "Beneficiary is already set to this address");

        address oldBeneficiary = vault.beneficiary;
        vault.beneficiary = newBeneficiary;
        _beneficiaryVaults[newBeneficiary].push(vaultId);

        emit BeneficiaryUpdated(vaultId, oldBeneficiary, newBeneficiary);
    }

    // View Functions

    /**
     * @notice Check whether a vault is currently eligible for triggering.
     */
    function isActionEligible(uint256 vaultId) external view vaultExists(vaultId) returns (bool) {
        Vault memory v = _vaults[vaultId];
        if (v.status != VaultStatus.ACTIVE) {
            return false;
        }
        return block.timestamp > (v.lastCheckIn + v.checkInInterval);
    }

    /**
     * @notice Returns the timestamp deadline for the next required check-in.
     */
    function getDeadline(uint256 vaultId) external view vaultExists(vaultId) returns (uint256) {
        return _vaults[vaultId].lastCheckIn + _vaults[vaultId].checkInInterval;
    }

    /**
     * @notice Returns complete vault details.
     */
    function getVault(uint256 vaultId) external view vaultExists(vaultId) returns (Vault memory) {
        return _vaults[vaultId];
    }

    /**
     * @notice Returns total number of vaults created.
     */
    function getVaultCount() external view returns (uint256) {
        return _vaultIdCounter;
    }

    /**
     * @notice Returns all vault IDs created by a specific user address.
     */
    function getUserVaults(address user) external view returns (uint256[] memory) {
        return _userVaults[user];
    }

    /**
     * @notice Returns all vault IDs where an address is designated as beneficiary.
     */
    function getBeneficiaryVaults(address beneficiary) external view returns (uint256[] memory) {
        return _beneficiaryVaults[beneficiary];
    }

    /**
     * @notice Returns all vaults in the system (useful for local inspection and dashboards).
     */
    function getAllVaults() external view returns (Vault[] memory) {
        Vault[] memory list = new Vault[](_vaultIdCounter);
        for (uint256 i = 1; i <= _vaultIdCounter; i++) {
            list[i - 1] = _vaults[i];
        }
        return list;
    }
}
