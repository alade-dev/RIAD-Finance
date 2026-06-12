// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISablierLockup } from "@sablier/v2-core/lockup/src/interfaces/ISablierLockup.sol";
import { LockupLinear } from "@sablier/v2-core/lockup/src/types/LockupLinear.sol";
import { Lockup } from "@sablier/v2-core/lockup/src/types/Lockup.sol";

/**
 * @title RIADFinancePayroll
 * @author RIAD Finance Team
 * @notice Core contract managing payroll streams using Sablier   LockupLinear streams on Arbitrum.
 */
contract RIADFinancePayroll is Ownable2Step, ReentrancyGuard {
    ISablierLockup public immutable sablierLockup;

    struct Company {
        string name;
        address employerWallet;
        address treasury;
        bool isRegistered;
    }

    struct StreamInfo {
        uint256 streamId;
        address employer;
        address employee;
        address token;
        uint128 amount;
        bool active;
    }

    struct ConfidentialEmployee {
        bytes encryptedName;
        bytes encryptedSalary;
    }

    // Mappings
    mapping(address => Company) public companies;
    address[] public registeredEmployers;

    // employer => token => balance
    mapping(address => mapping(address => uint256)) public treasuryBalances;

    // streamId => StreamInfo
    mapping(uint256 => StreamInfo) public streams;

    // employee => ConfidentialEmployee
    mapping(address => ConfidentialEmployee) public confidentialEmployees;

    // Events for Dune Analytics (maximum of 3 indexed fields)
    event CompanyRegistered(address indexed employer, string name);
    event TreasuryFunded(address indexed employer, address indexed token, uint256 amount, uint256 newBalance);
    event TreasuryWithdrawn(address indexed employer, address indexed token, uint256 amount, uint256 newBalance);
    event StreamCreated(uint256 indexed streamId, address indexed employer, address indexed employee, address token, uint128 amount);
    event StreamCanceled(uint256 indexed streamId, address indexed employer, uint128 refundedAmount);
    event ConfidentialDataProcessed(address indexed employee, bytes encryptedResult);

    constructor(address initialOwner, address _sablierLockup) Ownable(initialOwner) {
        require(_sablierLockup != address(0), "Invalid Sablier address");
        sablierLockup = ISablierLockup(_sablierLockup);
    }

    /**
     * @notice Register a new company/employer
     */
    function registerCompany(string calldata name) external {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        companies[msg.sender] = Company({
            name: name,
            employerWallet: msg.sender,
            treasury: address(this),
            isRegistered: true
        });
        registeredEmployers.push(msg.sender);
        emit CompanyRegistered(msg.sender, name);
    }

    /**
     * @notice Deposit ERC-20 tokens (e.g. USDC, WETH) to fund the company's treasury
     */
    function depositFunds(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(companies[msg.sender].isRegistered, "Company not registered");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        treasuryBalances[msg.sender][token] += amount;
        
        emit TreasuryFunded(msg.sender, token, amount, treasuryBalances[msg.sender][token]);
    }

    /**
     * @notice Withdraw ERC-20 tokens from the company's treasury balance
     */
    function withdrawFunds(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(treasuryBalances[msg.sender][token] >= amount, "Insufficient treasury balance");

        treasuryBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);

        emit TreasuryWithdrawn(msg.sender, token, amount, treasuryBalances[msg.sender][token]);
    }

    /**
     * @notice Create a linear stream for an employee using Sablier  
     */
    function createStream(
        address recipient,
        address token,
        uint128 depositAmount,
        uint40 cliffDuration,
        uint40 totalDuration
    ) external nonReentrant returns (uint256 streamId) {
        require(companies[msg.sender].isRegistered, "Company not registered");
        require(treasuryBalances[msg.sender][token] >= depositAmount, "Insufficient treasury balance");
        require(totalDuration > 0, "Duration must be greater than zero");
        require(cliffDuration < totalDuration, "Cliff must be less than total duration");

        // Deduct from employer's treasury balance
        treasuryBalances[msg.sender][token] -= depositAmount;

        // Approve Sablier contract to spend tokens
        IERC20(token).approve(address(sablierLockup), depositAmount);

        // Prepare parameters for Sablier LockupLinear
        Lockup.CreateWithDurations memory params = Lockup.CreateWithDurations({
            sender: address(this),
            recipient: recipient,
            depositAmount: depositAmount,
            token: IERC20(token),
            cancelable: true,
            transferable: false,
            shape: "linear"
        });

        LockupLinear.UnlockAmounts memory unlockAmounts = LockupLinear.UnlockAmounts({
            start: 0,
            cliff: 0
        });

        LockupLinear.Durations memory durations = LockupLinear.Durations({
            cliff: cliffDuration,
            total: totalDuration
        });

        uint40 granularity = 0; // 0 means per-second streaming

        // Call Sablier
        streamId = sablierLockup.createWithDurationsLL(
            params,
            unlockAmounts,
            granularity,
            durations
        );

        // Record stream info
        streams[streamId] = StreamInfo({
            streamId: streamId,
            employer: msg.sender,
            employee: recipient,
            token: token,
            amount: depositAmount,
            active: true
        });

        emit StreamCreated(streamId, msg.sender, recipient, token, depositAmount);
    }

    /**
     * @notice Cancel an active stream. Unstreamed funds will be refunded to the employer's treasury.
     */
    function cancelStream(uint256 streamId) external nonReentrant {
        StreamInfo storage stream = streams[streamId];
        require(stream.active, "Stream not active");
        require(stream.employer == msg.sender, "Only employer can cancel");

        // Cancel on Sablier
        uint128 refundedAmount = sablierLockup.cancel(streamId);
        stream.active = false;

        // Credit refunded funds back to company's treasury balance
        treasuryBalances[msg.sender][stream.token] += refundedAmount;

        emit StreamCanceled(streamId, msg.sender, refundedAmount);
    }

    /**
     * @notice Register confidential data for an employee (Fhenix hook)
     */
    function registerConfidentialEmployee(
        address employee,
        bytes calldata encryptedName,
        bytes calldata encryptedSalary
    ) external {
        require(companies[msg.sender].isRegistered, "Company not registered");
        confidentialEmployees[employee] = ConfidentialEmployee({
            encryptedName: encryptedName,
            encryptedSalary: encryptedSalary
        });
    }

    /**
     * @notice Process confidential data (Fhenix hook)
     */
    function processConfidentialSalary(address employee, bytes calldata encryptedSalaryProof) external {
        // In a Fhenix network, this would perform FHE computation on-chain.
        // For Arbitrum and general EVM compilation, we store the result and emit an event.
        emit ConfidentialDataProcessed(employee, encryptedSalaryProof);
    }
}
