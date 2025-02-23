import { ethers } from "ethers";

async function main() {
  console.log("Iniciando el deploy del contrato VideoNFTMarketplace en abcTestnet...");
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Please set PRIVATE_KEY in your environment variables");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Obtener el ContractFactory - necesitarás el ABI y bytecode
  const VideoNFTMarketplaceFactory = await getContractFactory("VideoNFTMarketplace", wallet);

  
  // Deployar el contrato
  const videoNFTMarketplace = await VideoNFTMarketplaceFactory.deploy();
  
  // Esperar a que el contrato se despliegue
  await videoNFTMarketplace.waitForDeployment();
  
  // Obtener la dirección del contrato
  const marketplaceAddress = await videoNFTMarketplace.getAddress();

  console.log("VideoNFTMarketplace desplegado en:", marketplaceAddress);

  // Esperar confirmaciones adicionales
  console.log("Esperando confirmaciones...");
  await videoNFTMarketplace.deploymentTransaction()?.wait(6);
  console.log("Deploy confirmado con 6 bloques de profundidad");
}

async function getContractFactory(contractName, signer) {
  // Necesitarás leer el ABI y bytecode del contrato compilado
  const artifacts = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
  return new ethers.ContractFactory(artifacts.abi, artifacts.bytecode, signer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 