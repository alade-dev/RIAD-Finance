// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TokenMath
 * @notice A library for handling EVM big-integer scaling and math for RIAD Finance.
 * Supports USDC (6 decimals) and WETH/ETH (18 decimals) math.
 */
library TokenMath {
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant WETH_DECIMALS = 18;

    uint256 public constant USDC_SCALE = 10 ** USDC_DECIMALS;
    uint256 public constant WETH_SCALE = 10 ** WETH_DECIMALS;

    /**
     * @notice Scales an amount from USDC (6 decimals) to WETH (18 decimals) equivalent format.
     */
    function scaleUsdcToWeth(uint256 amount) internal pure returns (uint256) {
        return amount * (10 ** (WETH_DECIMALS - USDC_DECIMALS));
    }

    /**
     * @notice Scales an amount from WETH (18 decimals) to USDC (6 decimals) equivalent format.
     * @dev Warns: potential precision loss when truncating to 6 decimals.
     */
    function scaleWethToUsdc(uint256 amount) internal pure returns (uint256) {
        return amount / (10 ** (WETH_DECIMALS - USDC_DECIMALS));
    }

    /**
     * @notice Helper to parse UI USDC inputs (using 6 decimals).
     */
    function toUsdc(uint256 amount) internal pure returns (uint256) {
        return amount * USDC_SCALE;
    }

    /**
     * @notice Helper to parse UI WETH inputs (using 18 decimals).
     */
    function toWeth(uint256 amount) internal pure returns (uint256) {
        return amount * WETH_SCALE;
    }
}
