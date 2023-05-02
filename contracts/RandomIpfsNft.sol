// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft_NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //Types Declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUM_WORDS = 1;

    //VRF Helpers
    mapping(uint => address) public s_requestIdToRequester;

    //NFT Variables
    uint public s_tokenCounter;
    uint internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_nftTokenUris;
    uint internal i_mintFee;

    //Events
    event NftRequested(uint indexed requestId, address requester);
    event NftMinted(Breed nftBreed, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subcriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory nftTokenUris,
        uint mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subcriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_nftTokenUris = nftTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft_NeedMoreETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToRequester[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint requestId, uint[] memory randomWords) internal override {
        address nftOwner = s_requestIdToRequester[requestId];
        uint newTokenId = s_tokenCounter;
        uint moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        //0-10 PUG
        //11-30 Shiba Inu
        //31-99 Saint Bernard

        Breed nftBreed = getBreedFromModdedRng(moddedRng);
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, s_nftTokenUris[uint(nftBreed)]);
        emit NftMinted(nftBreed, nftOwner);
    }

    function withdraw() public onlyOwner {
        uint amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(uint moddedRng) public pure returns (Breed) {
        uint cumulativeSum = 0;
        uint[3] memory chanceArray = getChanceArray();
        for (uint i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint) {
        return i_mintFee;
    }

    function getNftTokenUris(uint index) public view returns (string memory) {
        return s_nftTokenUris[index];
    }

    function getTokenCounter() public view returns (uint) {
        return s_tokenCounter;
    }
}
