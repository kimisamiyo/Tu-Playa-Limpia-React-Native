// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract TPLToken is ERC20, Ownable {

    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

    constructor()
        ERC20("TPL Token", "TPL")
        Ownable(msg.sender)
    {}

    // =========================
    // MINT (solo backend / owner)
    // =========================
    function mint(address to, uint256 amount) external onlyOwner {
        uint256 amountWithDecimals = amount * 10**decimals();
        require(totalSupply() + amountWithDecimals <= MAX_SUPPLY, "Max supply reached");
        _mint(to, amountWithDecimals);
    }

    // =========================
    // BURN voluntario
    // =========================
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    // =========================
    // TITULOS DINAMICOS
    // =========================
    function getTitle(address user) public view returns (string memory) {
        uint256 balance = balanceOf(user) / 10**decimals();

        if (balance >= 700) {
            return "Golden Eco Legend";
        } else if (balance >= 300) {
            return "Ocean Protector";
        } else if (balance >= 100) {
            return "Beach Guardian";
        } else {
            return "Cleanup Rookie";
        }
    }
}