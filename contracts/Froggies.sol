// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Froggies Token contract
/// @author Henri NAY
/// @notice You can use this contract for only the most basic simulation
/// @dev Froggies is a test ERC20
contract Froggies is ERC20 {
    constructor(
        address ownerSupplyAddress_,
        uint256 initialSupply,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        _mint(ownerSupplyAddress_, initialSupply);
    }
}
