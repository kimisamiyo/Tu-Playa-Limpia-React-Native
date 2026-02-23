// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TPLToken.sol";

contract DeployTPLToken is Script {
    function run() external {

        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        TPLToken token = new TPLToken();

        console.log("TPLToken deployed at:", address(token));

        vm.stopBroadcast();
    }
}