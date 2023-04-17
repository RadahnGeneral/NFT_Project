const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

describe("BasicNFT Unit Tests", () => {
    let basicNFT, deployer;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        // accounts = await getNamedAccounts();
        deployer = accounts[0];
        await deployments.fixture(["basicnft"]);

        basicNFT = await ethers.getContract("BasicNFT", deployer);
    });

    describe("constructor", () => {
        it("Initialise the NFT correctly", async () => {
            const name = await basicNFT.name();
            const symbol = await basicNFT.symbol();
            const tokenCounter = await basicNFT.getTokenCounter();

            assert.equal(tokenCounter, 0, "TokenCounter should be 0");
            assert.equal(name, "puppy");
            assert.equal(symbol, "PUP");
        });
    });

    describe("tokenURI", () => {
        it("Should return TokenURI correctly", async () => {
            const tokenURI = await basicNFT.tokenURI(0);
            assert.equal(
                tokenURI.toString(),
                "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json",
                "tokenURI should match"
            );
        });
    });

    describe("mintNFT", () => {
        beforeEach(async () => {
            const tx = await basicNFT.mintNft();
            await tx.wait(1);
        });

        it("Allows users to mint an NFT, and updates appropriately", async function () {
            const tokenURI = await basicNFT.tokenURI(0);
            const tokenCounter = await basicNFT.getTokenCounter();

            assert.equal(tokenCounter.toString(), "1");
            assert.equal(tokenURI, await basicNFT.TOKEN_URI());
        });

        it("Show the correct balance and owner of NFT", async () => {
            const deployerAddress = deployer.address;
            const deployerBalance = await basicNFT.balanceOf(deployerAddress);
            const owner = await basicNFT.ownerOf("0");

            assert.equal(deployerBalance.toString(), "1");
            assert.equal(owner, deployerAddress);
        });
    });
});
