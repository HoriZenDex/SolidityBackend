import { ethers } from "ethers";
import VideoNFTArtifact from "../artifacts/contracts/VideoNFT.sol/VideoNFT.json";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    // Configuración del proveedor y signer
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    const CONTRACT_ADDRESS = "0xdFa06Df62d6Ec8fF01503D185FD727555a024716";
    const TOKEN_ID = 1; // Reemplaza con el ID del token que quieres verificar

    // Crear instancia del contrato
    const videoNFT = new ethers.Contract(
        CONTRACT_ADDRESS,
        VideoNFTArtifact.abi,
        signer
    );

    try {
        // Obtener la dirección del wallet conectado
        const myAddress = await signer.getAddress();
        console.log(`Mi dirección: ${myAddress}`);

        // Verificar el dueño del NFT
        const owner = await videoNFT.ownerOf(TOKEN_ID);
        console.log(`Dueño del NFT #${TOKEN_ID}: ${owner}`);

        // Verificar si soy el dueño
        if (owner.toLowerCase() === myAddress.toLowerCase()) {
            console.log("¡Eres el dueño de este NFT!");
            
            // Opcional: Obtener los metadatos del NFT
            const metadata = await videoNFT.getVideoMetadata(TOKEN_ID);
            console.log("Metadatos del NFT:", {
                title: metadata[0],
                description: metadata[1],
                duration: metadata[2].toString(),
                uploadDate: new Date(Number(metadata[3]) * 1000).toISOString(),
                creator: metadata[4]
            });
        } else {
            console.log("No eres el dueño de este NFT");
        }

    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("nonexistent token")) {
            console.error(`El token #${TOKEN_ID} no existe`);
        } else {
            console.error("Error:", error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
}); 