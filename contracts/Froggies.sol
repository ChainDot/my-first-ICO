// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CoinCoin is ERC20 {
    constructor(address owner_, uint256 initialSupply) ERC20("Froggies", "FRG") {
        _mint(owner_, initialSupply);
    }
}
