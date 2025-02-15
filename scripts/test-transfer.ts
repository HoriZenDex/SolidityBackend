import { ethers } from "ethers";
import VideoNFTArtifact from "../artifacts/contracts/VideoNFT.sol/VideoNFT.json";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    // Configuración del proveedor y signer
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    
    const CONTRACT_ADDRESS = "0xdFa06Df62d6Ec8fF01503D185FD727555a024716";
    // Cambia esta dirección por la dirección real del destinatario
    const RECIPIENT_ADDRESS = "0xc471bfE76cbb0Fd7C0f2E4d2fD2e829813fB5130";

    // Crear instancia del contrato
    const videoNFT = new ethers.Contract(
        CONTRACT_ADDRESS,
        VideoNFTArtifact.abi,
        signer
    );

    try {
        console.log("Minteando nuevo video NFT...");
        const tx = await videoNFT.mintVideo(
            "Video de Prueba",
            "Este es un video NFT de prueba",
            180n,
            "ipfs://QmTu7tZ1gkbH2dhxVtHwcJrrZNM2FiQGF9nwpWKQxd4x1x"
        );

        console.log("Esperando confirmación...");
        const receipt = await tx.wait();
        
        // Obtener el tokenId del evento
        const event = receipt.logs[0];
        const tokenId = event.args.tokenId;
        
        console.log(`Video NFT minteado con ID: ${tokenId}`);

        // Verificar dueño actual
        const currentOwner = await videoNFT.ownerOf(tokenId);
        console.log(`Dueño actual: ${currentOwner}`);

        // Transferir NFT
        console.log(`Transfiriendo a ${RECIPIENT_ADDRESS}...`);
        const transferTx = await videoNFT.transferFrom(currentOwner, RECIPIENT_ADDRESS, tokenId);
        await transferTx.wait();

        // Verificar nuevo dueño
        const newOwner = await videoNFT.ownerOf(tokenId);
        console.log(`Nuevo dueño: ${newOwner}`);

        // Obtener metadatos
        const metadata = await videoNFT.getVideoMetadata(tokenId);
        console.log("Metadatos:", {
            title: metadata[0],
            description: metadata[1],
            duration: metadata[2].toString(),
            uploadDate: new Date(Number(metadata[3]) * 1000).toISOString(),
            creator: metadata[4]
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido:", error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});