import { ethers } from "ethers";

async function main() {
  console.log("Iniciando el deploy del contrato HorizenCheck en abcTestnet...");
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("Please set PRIVATE_KEY in your environment variables");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Obtener el ContractFactory para HorizenCheck
  const HorizenCheckFactory = await getContractFactory("HorizenCheck", wallet);
  
  // Deployar el contrato
  const horizenCheck = await HorizenCheckFactory.deploy("0x0a3ff4c31552be338334e2d821e38eb28853520b");
  
  // Esperar a que el contrato se despliegue
  await horizenCheck.waitForDeployment();
  
  // Obtener la dirección del contrato
  const tokenAddress = await horizenCheck.getAddress();

  console.log("HorizenCheck desplegado en:", tokenAddress);

  // Esperar confirmaciones adicionales
  console.log("Esperando confirmaciones...");
  await horizenCheck.deploymentTransaction()?.wait(6);
  console.log("Deploy confirmado con 6s");
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