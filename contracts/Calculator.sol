// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract Calculator {
    using Address for address payable;

    IERC20Metadata private _token;

    constructor(address FroggiesAddress) {
        _token = IERC20Metadata(FroggiesAddress);
    }

    function add(int256 nb1, int256 nb2) public returns (int256) {
        return nb1 + nb2;
    }

    function sub(int256 nb1, int256 nb2) public returns (int256) {
        return nb1 - nb2;
    }

    function mul(int256 nb1, int256 nb2) public returns (int256) {
        return nb1 * nb2;
    }

    function div(int256 nb1, int256 nb2) public returns (int256) {
        require(nb2 != 0, "Calculator: can not divide by zero");
        return nb1 / nb2;
    }

    function mod(int256 nb1, int256 nb2) public returns (int256) {
        require(nb2 != 0, "Calculator: can not modulo by zero");
        return nb1 % nb2;
    }
}
