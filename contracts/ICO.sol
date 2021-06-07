// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/// @title Test ICO Token contract
/// @author Henri NAY
/// @notice You can use this contract for only the most basic simulation
/// @dev This is an experimental contract.
contract ICO is Ownable {
    /// @notice
    /// @dev
    /// @param ownerSupplyAddress address of token supplier.
    /// @param FroggiesAddress address of token contract.
    /// @param rate_ value in wei per token.
    using Address for address payable;
    // The token being sold
    IERC20Metadata private _token;

    // value in wei per token
    uint256 private _rate;

    // start time of ICO
    uint256 private _releaseTime;

    //2 weeks time
    uint256 private _twoWeeks = 2 * 1 weeks;

    //OwnerSupply of Froggies ERC20 address
    address private _ownerSupplyAddress;

    //Event
    event BoughtTokens(address indexed recipient, uint256 tokenAmount);
    event BoughtValue(address indexed recipient, uint256 amount);
    event Withdrew(address indexed owner, uint256 amount);
    event Refund(address indexed sender, uint256 refund);

    // Constructor
    constructor(
        address ownerSupplyAddress_,
        address froggiesAddress,
        uint256 rate_
    ) Ownable() {
        require(rate_ > 0, "ICO: Sorry rate cannot be zero");
        _token = IERC20Metadata(froggiesAddress);
        _rate = rate_;
        _releaseTime = block.timestamp;
        _ownerSupplyAddress = ownerSupplyAddress_;
    }

    ///@notice direct transfer of wei from metamask to the ICO token address and transfer the amount of token to sender account.
    receive() external payable {
        require(msg.value >= 1 gwei, "ICO: You must buy as least 1 gwei");
        require(msg.value <= 10 gwei, "ICO: You cannot buy more than 10 gwei");
        require(_releaseTime + _twoWeeks >= block.timestamp, "ICO: Too late the offer has ended");

        _buyTokens(msg.sender, msg.value);
        emit BoughtValue(msg.sender, msg.value);
    }

    /// @notice transfer the deposit wei amount into the ICO contract address and transfer amount of token to sender account.
    function buyTokens() public payable {
        require(msg.value >= 1 gwei, "ICO: You must buy as least 1 gwei");
        require(msg.value <= 10 gwei, "ICO: You cannot buy more than 10 gwei");
        require(_releaseTime + _twoWeeks >= block.timestamp, "ICO: Too late the offer has ended");

        _buyTokens(msg.sender, msg.value);
        emit BoughtValue(msg.sender, msg.value);
    }

    /// @notice only owner can withdraw the total wei amount from the ICO contract address.
    function withdraw() public payable onlyOwner {
        require(address(this).balance > 0, "ICO: 0 balance nobody bought your shitcoin");
        require(_releaseTime + _twoWeeks <= block.timestamp, "ICO: You have to wait till the end of the ICO");

        uint256 jackpot = address(this).balance;
        payable(msg.sender).sendValue(jackpot);
        emit Withdrew(msg.sender, jackpot);
    }

    /// getters

    /// @notice Returns the owner address of the supplied coin.
    function ownerSupplyAddress() public view returns (address) {
        return _ownerSupplyAddress;
    }

    /// @notice Returns the token supply for the ICO.
    function ownerTokenSupply() public view returns (uint256) {
        return _token.balanceOf(_ownerSupplyAddress);
    }

    /// @notice Returns contract address of the Froggies token
    function displayFroggiesTokenAddress() public view returns (IERC20Metadata) {
        return _token;
    }

    /// @notice Returns the number of token compare to the amount entered
    function numberOfTokens(uint256 weiAmount) public view returns (uint256) {
        return weiAmount / _rate;
    }

    /// @notice Returns the balance of wei in the ICO contract
    function weiFundsRaised() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Returns the balance equivalent in token in the ICO contract
    function totalTokenSold() public view returns (uint256) {
        return numberOfTokens(weiFundsRaised());
    }

    /// @notice Returns price per token
    function rate() public view returns (uint256) {
        return _rate;
    }

    /// @notice Returns time remaining in sec before the end of the ICO
    function releaseTime() public view returns (uint256) {
        return (_releaseTime + _twoWeeks) - block.timestamp;
    }

    //Private

    function _buyTokens(address recipient, uint256 amount) private {
        uint256 tokenAmount = amount / _rate;
        uint256 refund;

        if (ownerTokenSupply() < tokenAmount) {
            refund = tokenAmount - ownerTokenSupply();
            uint256 refundWei = refund * _rate;
            payable(recipient).sendValue(refundWei);
        }
        _token.transferFrom(_ownerSupplyAddress, recipient, tokenAmount);
        emit BoughtTokens(recipient, tokenAmount);
    }
}
