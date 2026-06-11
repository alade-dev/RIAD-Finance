// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import {RIADFinancePayroll} from "../src/RIADFinancePayroll.sol";

/**
 * @title DeployScript
 * @author RIAD Finance Team
 * @notice Deployment script for RIAD Finance contracts on Arbitrum
 */

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        address sablierAddress = vm.envOr("SABLIER_LOCKUP_LINEAR", address(0));
        vm.startBroadcast();

        RIADFinancePayroll payroll = new RIADFinancePayroll(
            msg.sender,
            sablierAddress
        );
        console.log("RIADFinancePayroll deployed to:", address(payroll));

        vm.stopBroadcast();
    }
}
