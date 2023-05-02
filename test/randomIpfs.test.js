const { assert, expect } = require("chai");
const { ethers, network, deployments } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs NFT Unit test", () => {
          let randomIpfs, deployer, vrfCoordinatorV2Mock;

          beforeEach(async () => {
              accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["mocks", "randomipfs"]);
              randomIpfs = await ethers.getContract("RandomIpfsNft", deployer);
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
          });

          describe("constructor", () => {
              it("Setting starting values correctly", async () => {
                  const name = await randomIpfs.name();
                  const symbol = await randomIpfs.symbol();
                  const tokenCounter = await randomIpfs.getTokenCounter();
                  const nftTokenUriZero = await randomIpfs.getNftTokenUris(0);

                  assert(nftTokenUriZero.includes("ipfs.io/ipfs"));
                  assert.equal(name, "Random IPFS NFT");
                  assert.equal(symbol, "RIN");
                  assert.equal(tokenCounter.toNumber(), 0);
              });
          });

          describe("requestNft", () => {
              it("Fails if payment isnt sent with the request", async () => {
                  await expect(randomIpfs.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft_NeedMoreETHSent"
                  );
              });

              it("reverts if payment is less than the mint fee", async () => {
                  const fee = await randomIpfs.getMintFee();
                  await expect(
                      randomIpfs.requestNft({
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWith("RandomIpfsNft_NeedMoreETHSent");
              });

              it("emits and event and kicks off a random word request", async () => {
                  const fee = await randomIpfs.getMintFee();
                  await expect(randomIpfs.requestNft({ value: fee.toString() })).to.emit(
                      randomIpfs,
                      "NftRequested"
                  );
              });
          });

          describe("fulfillRandomWords", () => {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfs.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfs.tokenURI("0");
                              const tokenCounter = await randomIpfs.getTokenCounter();
                              assert.equal(tokenUri.toString().includes("ipfs.io/ipfs"), true);
                              assert.equal(tokenCounter.toString(), "1");
                              resolve();
                          } catch (e) {
                              reject(e);
                          }
                      });
                      try {
                          const fee = await randomIpfs.getMintFee();
                          const requestNftResponse = await randomIpfs.requestNft({
                              value: fee.toString(),
                          });
                          const requestNftReceipt = await requestNftResponse.wait(1);
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfs.address
                          );
                      } catch (e) {
                          reject(e);
                      }
                  });
              });
          });

          describe("getBreedFromModdedRng", () => {
              it("should return pug if moddedRng < 10", async () => {
                  const expectedValue = await randomIpfs.getBreedFromModdedRng(7);
                  assert.equal(expectedValue, 0);
              });
              it("should return shiba-inu if 10<= moddedRng <= 39", async () => {
                  const expectedValue = await randomIpfs.getBreedFromModdedRng(21);
                  assert.equal(expectedValue, 1);
              });
              it("should return st. bernard if 40 <= moddedRng <=99", async () => {
                  const expectedValue = await randomIpfs.getBreedFromModdedRng(77);
                  assert.equal(expectedValue, 2);
              });
              it("should revert if moddedRng > 99", async () => {
                  await expect(randomIpfs.getBreedFromModdedRng(100)).to.be.revertedWith("");
              });
          });
      });
