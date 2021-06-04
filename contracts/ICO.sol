// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract ICO is Ownable {
    using Address for address payable;
    /// The token being sold
    IERC20Metadata private _token;

    /// value in wei per token
    uint256 private _rate;

    /// start time of ICO
    uint256 private _releaseTime;

    ///2 weeks time
    uint256 private _2weeks = 2 * 1 weeks;

    ///OwnerSupply of Froggies ERC20 address
    address private _ownerSupplyAddress;

    ///Event
    event BoughtTokens(address indexed recipient, uint256 amount);
    event Withdrew(address indexed owner, uint256 amount);
    event Refund(address indexed sender, uint256 refund);

    /// Constructor
    constructor(
        address ownerSupplyAddress_,
        address FroggiesAddress,
        uint256 rate_
    ) Ownable() {
        require(rate_ > 0, "ICO: Sorry rate cannot be zero");
        _token = IERC20Metadata(FroggiesAddress);
        _rate = rate_;
        _releaseTime = block.timestamp;
        _ownerSupplyAddress = ownerSupplyAddress_;
    }

    receive() external payable {
        uint256 refund;
        require(msg.value >= 1 gwei, "ICO: You must buy as least 1 gwei");
        require(msg.value >= 10 gwei, "ICO: You cannot buy more than 10 gwei");
        require(_releaseTime + _2weeks >= block.timestamp, "ICO: Too late the offer has ended");
        if (_ownerSupplyAddress.balance <= msg.value) {
            refund = msg.value - _ownerSupplyAddress.balance;
            payable(msg.sender).sendValue(refund);
        }
        uint256 amount = msg.value - refund;
        _buyTokens(msg.sender, amount);
        emit BoughtTokens(msg.sender, amount);
    }

    function buyTokens() public payable {
        require(msg.value >= 1 gwei, "ICO: You must buy as least 1 gwei");
        require(msg.value <= 10 gwei, "ICO: You cannot buy more than 10 gwei");
        require(_releaseTime + _2weeks >= block.timestamp, "ICO: Too late the offer has ended");
        uint256 refund;
        if (_ownerSupplyAddress.balance <= msg.value) {
            refund = msg.value - _ownerSupplyAddress.balance;
            payable(msg.sender).sendValue(refund);
            emit Refund(msg.sender, refund);
        }
        uint256 amount = msg.value - refund;
        _buyTokens(msg.sender, amount);
        emit BoughtTokens(msg.sender, amount);
    }

    function withdraw() public payable onlyOwner {
        require(address(this).balance > 0, "ICO: 0 balance nobody bought your shitcoin");
        require(_releaseTime + _2weeks <= block.timestamp, "ICO: You have to wait till the end of the ICO");
        uint256 jackpot = address(this).balance;
        payable(msg.sender).sendValue(jackpot);
        emit Withdrew(msg.sender, jackpot);
    }

    /// getters

    function OwnerSupplyAddress() public view returns (address) {
        return _ownerSupplyAddress;
    }

    function displayFroggiesTokenAddress() public view returns (IERC20Metadata) {
        return _token;
    }

    function numberOfTokens(uint256 weiAmount) public view returns (uint256) {
        return weiAmount / _rate;
    }

    function weiFundsRaised() public view returns (uint256) {
        return address(this).balance;
    }

    function totalTokenSold() public view returns (uint256) {
        return numberOfTokens(weiFundsRaised());
    }

    function rate() public view returns (uint256) {
        return _rate;
    }

    function releaseTime() public view returns (uint256) {
        return (_releaseTime + _2weeks) - block.timestamp;
    }

    function _buyTokens(address recipient, uint256 amount) private {
        uint256 tokenAmount = _rate * amount;
        _token.transferFrom(_ownerSupplyAddress, recipient, tokenAmount);
        emit BoughtTokens(recipient, amount);
    }
}
