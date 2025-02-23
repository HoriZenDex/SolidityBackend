import { ethers } from "ethers";

async function main() {
  console.log("Iniciando el deploy del contrato RPToken en abcTestnet...");
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Please set PRIVATE_KEY in your environment variables");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Obtener el ContractFactory para RPToken
  const RPTokenFactory = await getContractFactory("RPToken", wallet);
  
  // Deployar el contrato
  const rpToken = await RPTokenFactory.deploy();
  
  // Esperar a que el contrato se despliegue
  await rpToken.waitForDeployment();
  
  // Obtener la dirección del contrato
  const tokenAddress = await rpToken.getAddress();

  console.log("RPToken desplegado en:", tokenAddress);

  // Esperar confirmaciones adicionales
  console.log("Esperando confirmaciones...");
  await rpToken.deploymentTransaction()?.wait(6);
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