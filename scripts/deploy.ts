import { ethers } from "ethers";

async function main() {
  console.log("Iniciando el deploy del contrato VideoNFT...");

  // Aquí necesitarás obtener el provider y signer de manera explícita
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("Please set PRIVATE_KEY in your environment variables");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Obtener el ContractFactory - necesitarás el ABI y bytecode
  const VideoNFTFactory = await getContractFactory("VideoNFT", wallet);
  
  // Deployar el contrato
  const videoNFT = await VideoNFTFactory.deploy();
  
  // Esperar a que el contrato se despliegue
  await videoNFT.waitForDeployment();
  
  // Obtener la dirección del contrato
  const videoNFTAddress = await videoNFT.getAddress();

  console.log("VideoNFT desplegado en:", videoNFTAddress);
}

// Función auxiliar para obtener el contract factory
async function getContractFactory(contractName, signer) {
  // Necesitarás leer el ABI y bytecode del contrato compilado
  const artifacts = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
  return new ethers.ContractFactory(artifacts.abi, artifacts.bytecode, signer);
}

// Ejecutar el script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });