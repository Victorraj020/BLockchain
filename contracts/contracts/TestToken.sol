// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev Mock ERC-20 token for Dead-Man Switch testing and local development.
 * Includes a public faucet function so any test wallet can request tokens.
 */
contract TestToken is ERC20, Ownable {
    uint8 private constant _DECIMALS = 18;
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**_DECIMALS; // 1,000 TEST tokens

    // Faucet cooldown to avoid spamming
    mapping(address => uint256) public lastFaucetRequest;
    uint256 public constant FAUCET_COOLDOWN = 1 minutes;

    event FaucetClaimed(address indexed recipient, uint256 amount);

    constructor() ERC20("Test Token", "TEST") Ownable(msg.sender) {
        // Mint initial supply of 1,000,000 TEST to deployer
        _mint(msg.sender, 1_000_000 * 10**_DECIMALS);
    }

    /**
     * @notice Allows any user to claim test tokens for local demo and testnet testing.
     * @param recipient The address receiving the test tokens.
     */
    function faucet(address recipient) external {
        require(recipient != address(0), "Cannot claim to zero address");
        require(
            block.timestamp >= lastFaucetRequest[recipient] + FAUCET_COOLDOWN,
            "Faucet cooldown active. Please wait 1 minute."
        );

        lastFaucetRequest[recipient] = block.timestamp;
        _mint(recipient, FAUCET_AMOUNT);

        emit FaucetClaimed(recipient, FAUCET_AMOUNT);
    }

    /**
     * @notice Arbitrary minting function for owner or demo setup
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
