// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MissionNFT.sol";

contract DeployMissionNFT is Script {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        MissionNFT missionNFT = new MissionNFT();
        console.log("MissionNFT desplegado en:", address(missionNFT));

        vm.stopBroadcast();
    }
}