const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");

describe("BasicNFT Unit Tests", () => {
    let basicNFT, deployer;

    beforeEach(async () => {
        deployer = (await getNamedAccounts).deployer;
        await deployments.fixture(["basicnft"]);

        basicNFT = await ethers.getContract("BasicNFT", deployer);
    });

    describe("constructor", () => {
        it("Initialise tokencounter correctly", async () => {
            const tokenCounter = basicNFT.getTokenCounter();

            assert(tokenCounter, 0, "TokenCounter should be 0");
        });
    });
});
