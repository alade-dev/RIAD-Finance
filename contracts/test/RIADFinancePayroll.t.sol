// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { RIADFinancePayroll } from "../src/RIADFinancePayroll.sol";
import { ISablierLockup } from "@sablier/v2-core/lockup/src/interfaces/ISablierLockup.sol";
import { LockupLinear } from "@sablier/v2-core/lockup/src/types/LockupLinear.sol";
import { Lockup } from "@sablier/v2-core/lockup/src/types/Lockup.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6);
    }
}

contract MockSablierLockupLinear {
    uint256 public nextStreamId = 1;
    mapping(uint256 => uint128) public streamRefunds;
    mapping(uint256 => address) public streamTokens;

    function createWithDurationsLL(
        Lockup.CreateWithDurations calldata params,
        LockupLinear.UnlockAmounts calldata,
        uint40,
        LockupLinear.Durations calldata
    ) external payable returns (uint256 streamId) {
        streamId = nextStreamId++;
        require(params.token.transferFrom(msg.sender, address(this), params.depositAmount));
        streamRefunds[streamId] = params.depositAmount;
        streamTokens[streamId] = address(params.token);
    }

    function cancel(uint256 streamId) external payable returns (uint128 refundedAmount) {
        refundedAmount = streamRefunds[streamId];
        address token = streamTokens[streamId];
        require(IERC20(token).transfer(msg.sender, refundedAmount));
    }
}

contract RIADFinancePayrollTest is Test {
    RIADFinancePayroll public payroll;
    MockERC20 public token;
    MockSablierLockupLinear public mockSablier;

    address public owner = address(0x1);
    address public employer = address(0x2);
    address public employee = address(0x3);

    function setUp() public {
        vm.startPrank(owner);
        mockSablier = new MockSablierLockupLinear();
        payroll = new RIADFinancePayroll(owner, address(mockSablier));
        vm.stopPrank();

        token = new MockERC20();
        require(token.transfer(employer, 10000 * 10**6));
    }

    function testCompanyRegistration() public {
        vm.startPrank(employer);
        payroll.registerCompany("Google");
        
        (string memory name, address wallet, address treasury, bool isRegistered) = payroll.companies(employer);
        assertEq(name, "Google");
        assertEq(wallet, employer);
        assertEq(treasury, address(payroll));
        assertTrue(isRegistered);
        vm.stopPrank();
    }

    function testTreasuryFunding() public {
        vm.startPrank(employer);
        payroll.registerCompany("Google");

        token.approve(address(payroll), 5000 * 10**6);
        payroll.depositFunds(address(token), 5000 * 10**6);

        assertEq(payroll.treasuryBalances(employer, address(token)), 5000 * 10**6);
        assertEq(token.balanceOf(address(payroll)), 5000 * 10**6);
        vm.stopPrank();
    }

    function testWithdrawFunds() public {
        vm.startPrank(employer);
        payroll.registerCompany("Google");

        token.approve(address(payroll), 5000 * 10**6);
        payroll.depositFunds(address(token), 5000 * 10**6);

        payroll.withdrawFunds(address(token), 2000 * 10**6);
        assertEq(payroll.treasuryBalances(employer, address(token)), 3000 * 10**6);
        assertEq(token.balanceOf(employer), 7000 * 10**6);
        vm.stopPrank();
    }

    function testCreateStream() public {
        vm.startPrank(employer);
        payroll.registerCompany("Google");

        token.approve(address(payroll), 5000 * 10**6);
        payroll.depositFunds(address(token), 5000 * 10**6);

        uint256 streamId = payroll.createStream(
            employee,
            address(token),
            1000 * 10**6,
            0,
            30 days
        );

        assertEq(streamId, 1);
        assertEq(payroll.treasuryBalances(employer, address(token)), 4000 * 10**6);
        
        (uint256 id, address emp, address empAddress, address tok, uint128 amt, bool active) = payroll.streams(streamId);
        assertEq(id, 1);
        assertEq(emp, employer);
        assertEq(empAddress, employee);
        assertEq(tok, address(token));
        assertEq(amt, 1000 * 10**6);
        assertTrue(active);
        vm.stopPrank();
    }

    function testCancelStream() public {
        vm.startPrank(employer);
        payroll.registerCompany("Google");

        token.approve(address(payroll), 5000 * 10**6);
        payroll.depositFunds(address(token), 5000 * 10**6);

        uint256 streamId = payroll.createStream(
            employee,
            address(token),
            1000 * 10**6,
            0,
            30 days
        );

        payroll.cancelStream(streamId);
        
        // In the mock, full refund is returned
        assertEq(payroll.treasuryBalances(employer, address(token)), 5000 * 10**6);
        
        (,,,,, bool active) = payroll.streams(streamId);
        assertFalse(active);
        vm.stopPrank();
    }

    function testConfidentialEmployee() public {
        vm.startPrank(employer);
        payroll.registerCompany("Google");

        bytes memory encryptedName = abi.encodePacked("Confidential Employee");
        bytes memory encryptedSalary = abi.encodePacked(uint256(100000));

        payroll.registerConfidentialEmployee(employee, encryptedName, encryptedSalary);

        (bytes memory storedName, bytes memory storedSalary) = payroll.confidentialEmployees(employee);
        assertEq(storedName, encryptedName);
        assertEq(storedSalary, encryptedSalary);
        vm.stopPrank();
    }
}
