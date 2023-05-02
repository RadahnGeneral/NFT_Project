require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
// const PRIVATE_KEY_A1 = process.env.PRIVATE_KEY_A1;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY_A4 = process.env.PRIVATE_KEY_A4;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

// const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        // localHardhat: {
        //   chainId: 31337,
        //   url: ""
        // },
        localHardhat: {
            chainId: 31337,
            url: "http://127.0.0.1:8545/",
        },

        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY_A4],
        },

        sepolia: {
            chainId: 11155111,
            blockConfirmations: 6,
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY_A4],
        },
    },
    solidity: {
        compilers: [{ version: "0.8.7" }, { version: "0.4.19" }, { version: "0.6.12" }],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
    player: {
        default: 1,
    },
    etherscan: { goerli: ETHERSCAN_API_KEY },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    mocha: {
        timeout: 300000,
    },
};
