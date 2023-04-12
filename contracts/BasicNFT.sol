// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity >=0.6.0 <0.9.0;

contract BasicNFT is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint private s_tokenCounter;

    constructor() ERC721("puppy", "PUP") {
        s_tokenCounter = 0;
    }

    function tokenURI(uint /*tokenId */) public view override returns (string memory) {
        return TOKEN_URI;
    }

    function mintNft() public returns (uint) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    function getTokenCounter() public view returns (uint) {
        return s_tokenCounter;
    }
}
