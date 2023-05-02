const { network, ethers } = require("hardhat");

const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");

const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSVG = await fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf8" });
    const highSVG = await fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" });

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG];
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmation || 1,
    });
};

module.exports.tags = ["all", "dynamicsvg", "main"];
