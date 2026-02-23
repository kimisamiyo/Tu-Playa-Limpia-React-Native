// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract MissionNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    mapping(uint256 => mapping(address => bool)) public missionCompleted;

    constructor() ERC721("Clean Missions", "CMISS") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function completeMission(
        uint256 missionId,
        string memory tokenURI
    ) external {
        require(!missionCompleted[missionId][msg.sender], "Mission already completed");

        uint256 tokenId = tokenCounter;
        tokenCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        missionCompleted[missionId][msg.sender] = true;
    }
}