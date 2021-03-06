// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./AaveNonProxy.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface AaveVaultProxy {
    // amount needs to be normalized
    function borrow(
        AaveCollateralVault vault,
        address reserve,
        uint256 amount
    ) external;

    // function repay(
    //     AaveCollateralVault vault,
    //     address reserve,
    //     uint256 amount
    // ) external;
}

interface IConditionalTokens {
    function splitPosition(
        address collateralToken,
        bytes32 parentCollectionId,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 amount
    ) external;

    function reportPayouts(bytes32 questionId, uint256[] calldata payouts)
        external;
}

contract HolderContract is ERC1155Holder {
    using SafeMath for uint256;

    AaveCollateralVault private vault;
    IERC1155 private CTtoken1155; //https://forum.openzeppelin.com/t/example-on-how-to-use-erc20-token-in-another-contract/1682
    IConditionalTokens private CTtoken;
    IERC20 private ERC20token;
    address public CTtokenAddress;
    address public owner;
    address public bidder;
    address public auditor; //change to array later
    string public projectName;
    uint256 public numberMilestones = 3; //make this dynamic later, should we store
    uint256[] public budgets;
    uint256[] public timelines;
    uint256 public totalValue = 0;

    constructor(
        string memory _projectName,
        address _CTtokenAddress,
        address _DaiAddress,
        address _owner,
        address _bidder,
        address _auditor,
        uint256[] memory _budgets,
        uint256[] memory _timelines
    ) public {
        projectName = _projectName;
        CTtoken1155 = IERC1155(_CTtokenAddress);
        CTtoken = IConditionalTokens(_CTtokenAddress);
        ERC20token = IERC20(_DaiAddress);
        CTtokenAddress = _CTtokenAddress;
        owner = _owner;
        bidder = _bidder;
        auditor = _auditor;
        budgets = _budgets;
        timelines = _timelines;
    }

    function recieveERC20(address _sender, uint256 _value) external {
        ERC20token.transferFrom(_sender, address(this), _value); //actual transfer
        totalValue = totalValue.add(_value);
        ERC20token.approve(CTtokenAddress, totalValue);
    }

    //need a second recieve function for AAVE? and then have AAVE as a selection for split position?
    function borrowERC20(
        address _proxy,
        address _vault,
        address _reserve,
        uint256 _value
    ) external {
        vault = AaveCollateralVault(_vault);
        AaveVaultProxy proxy = AaveVaultProxy(_proxy);
        totalValue = totalValue.add(_value);
        proxy.borrow(vault, _reserve, _value);
    }

    // Helper functions
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getBudgets() external view returns (uint256[] memory) {
        return budgets;
    }

    function getTimelines() external view returns (uint256[] memory) {
        return timelines;
    }

    //CT functions//
    function callSplitPosition(
        address tokenaddress,
        bytes32 parent,
        bytes32 conditionId,
        uint256[] calldata partition,
        uint256 value //bytes32 approvalPositionId,
    ) external {
        CTtoken.splitPosition(
            tokenaddress,
            parent,
            conditionId,
            partition,
            value
        );
        totalValue = totalValue.sub(value);
        //need to make it so only approve position id is transferrable? do we store in storage or call transfer internally? Since bidder is calling split,
    }

    //transfer CT tokens to bidder wallet for a certain positionId.
    function transferCTtoBidder(uint256 positionId) external payable {
        require(
            msg.sender == bidder,
            "only bidder can redeem conditional tokens"
        );
        uint256 heldAmount = CTtoken1155.balanceOf(address(this), positionId); //need to make it so only approve position id is transferrable

        CTtoken1155.safeTransferFrom(
            address(this),
            msg.sender,
            positionId,
            heldAmount,
            ""
        );
    }

    //reportPayouts()
    function callReportPayouts(bytes32 questionID, uint256[] calldata outcome)
        external
    {
        require(msg.sender == auditor, "not auditor"); //later this should only be called from governance contract with a vote
        CTtoken.reportPayouts(questionID, outcome);
    }
}
