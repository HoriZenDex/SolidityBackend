import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    abcTestnet: {
      url: "https://rpc.abc.t.raas.gelato.cloud",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 112
    }
  },
  etherscan: {
    apiKey: {
      abcTestnet: 'empty'
    },
    customChains: [
      {
        network: "abcTestnet",
        chainId: 112,
        urls: {
          apiURL: "https://explorer.abc.t.raas.gelato.cloud/api",
          browserURL: "https://explorer.abc.t.raas.gelato.cloud"
        }
      }
    ]
  }
};

export default config;
