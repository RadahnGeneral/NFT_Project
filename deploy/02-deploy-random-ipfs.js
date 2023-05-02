const { network, ethers } = require("hardhat");

const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");

const { verify } = require("../utils/verify");

const imagesLocation = "./images/randomNft";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
};

let tokenUris = [
    "ipfs.io/ipfs.Qmd9giDQXedrhCHo1PuNXJWvTmKE7cQUTmPog9PkBMVr71",
    "ipfs.io/ipfs.QmVS72hXs9BJfFuXFHB9Z4U9gvQTLQgLoiedBsjJwG85QQ",
    "ipfs.io/ipfs.QmfB2LKSyZ5x8g7HLUDS6Bt2ifS2mMwSppPNrSb4uGDH71",
];

const FUND_AMOUNT = "1000000000000000000000";

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;
    let vrfCoordinatorV2Mock;

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    let vrfCoordinatorV2Address, subscriptionId;

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }
    log("-----------------------------");
    // await storeImages(imagesLocation);

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        networkConfig[chainId].mintFee,
    ];

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address);
    // log("-----------------------------");
};

async function handleTokenUris() {
    tokenUris = [];

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);

    for (index in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate };
        tokenUriMetadata.name = files[index].replace(".png", "");
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup`;
        tokenUriMetadata.image = `ipfs.io/ipfs/${imageUploadResponses[index].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name}...`);
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs.io/ipfs.${metadataUploadResponse.IpfsHash}`);
    }
    console.log("Token URIs Uploaded. They are: ");
    console.log(tokenUris);
    return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
