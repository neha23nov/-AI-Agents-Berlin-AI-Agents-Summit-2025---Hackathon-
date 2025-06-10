require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0x8a0d300901302f102c396921046200a15b0baff149f76d4c9c91a4a701d33dff"
      ]
    }
  }
};
