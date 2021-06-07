// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Calculator
/// @author Henri Nay
/// @notice You can use this contract for only the most basic simulation
/// @dev experimental This is an experimental contract.
contract Calculator is Ownable {
    using Address for address payable;

    IERC20Metadata private _token;

    uint256 private _fees;

    // Event

    event Calculated(address indexed sender, string add, int256 nb1, int256 nb2, int256 operation);

    // Constructor

    constructor(address froggiesAddress, uint256 fees_) {
        _token = IERC20Metadata(froggiesAddress);
        _fees = fees_;
    }

    /// @dev modifier to require user must have a minimun token balance as well as a given allowance.
    modifier requirements() {
        require(_token.balanceOf(msg.sender) >= _fees, "Calculator: insufficient balance please top up your account");
        require(
            _token.allowance(msg.sender, address(this)) >= _fees,
            "Calculator: increase the calculator contract allowance"
        );
        _;
    }

    // Main

    /// @notice this function will add nb1 by nb2
    /// @param nb1 input number 1
    /// @param nb2 input number 2
    function add(int256 nb1, int256 nb2) public requirements returns (int256) {
        _token.transferFrom(msg.sender, owner(), _fees);
        emit Calculated(msg.sender, "add", nb1, nb2, nb1 + nb2);
        return nb1 + nb2;
    }

    /// @notice this function will subtract nb1 by nb2
    /// @param nb1 input number 1
    /// @param nb2 input number 2
    function sub(int256 nb1, int256 nb2) public requirements returns (int256) {
        _token.transferFrom(msg.sender, owner(), _fees);
        emit Calculated(msg.sender, "sub", nb1, nb2, nb1 - nb2);
        return nb1 - nb2;
    }

    /// @notice this function will multiple nb1 by nb2
    /// @param nb1 input number 1
    /// @param nb2 input number 2
    function mul(int256 nb1, int256 nb2) public requirements returns (int256) {
        _token.transferFrom(msg.sender, owner(), _fees);
        emit Calculated(msg.sender, "mul", nb1, nb2, nb1 * nb2);
        return nb1 * nb2;
    }

    /// @notice this function will divide nb1 by nb2
    /// @param nb1 input number 1
    /// @param nb2 input number 2
    function div(int256 nb1, int256 nb2) public requirements returns (int256) {
        _token.transferFrom(msg.sender, owner(), _fees);
        require(nb2 != 0, "Calculator: can not divide by zero");
        emit Calculated(msg.sender, "div", nb1, nb2, nb1 / nb2);
        return nb1 / nb2;
    }

    /// @notice this function will get the remainder of the division nb1 by nb2
    /// @param nb1 input number 1
    /// @param nb2 input number 2
    function mod(int256 nb1, int256 nb2) public requirements returns (int256) {
        _token.transferFrom(msg.sender, owner(), _fees);
        require(nb2 != 0, "Calculator: can not modulo by zero");
        emit Calculated(msg.sender, "mod", nb1, nb2, nb1 % nb2);
        return nb1 % nb2;
    }

    // Getters

    ///@dev Returns wei price per token
    function fees() public view returns (uint256) {
        return _fees;
    }

    ///@dev Returns the Token balance of the owner
    function ownerTokenBalance() public view returns (uint256) {
        return _token.balanceOf(owner()) / _fees;
    }

    ///@dev Returns the wei balance of the owner
    function ownerWeiBalance() public view returns (uint256) {
        return _token.balanceOf(owner());
    }

    ///@dev Returns the Froggies token contract address
    function froggiesTokenAddress() public view returns (IERC20Metadata) {
        return _token;
    }
}
