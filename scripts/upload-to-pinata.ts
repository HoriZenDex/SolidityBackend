import { ethers } from "ethers";
import * as fs from 'fs';
import pinataSDK from '@pinata/sdk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Pinata
const pinata = new pinataSDK({ 
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_KEY
});

// O alternativamente, puedes usar el constructor con dos parámetros
// const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

interface VideoMetadata {
    title: string;
    description: string;
    duration: number;
    fileName: string;
}

async function uploadToPinata(filePath: string, name: string) {
    try {
        const readableStreamForFile = fs.createReadStream(filePath);
        const options = {
            pinataMetadata: {
                name: name
            }
        };
        
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log(`Archivo ${name} subido a IPFS con hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error(`Error al subir ${name}:`, error);
        throw error;
    }
}

async function createAndUploadMetadata(
    videoHash: string, 
    metadata: VideoMetadata
) {
    const nftMetadata = {
        name: metadata.title,
        description: metadata.description,
        animation_url: `ipfs://${videoHash}`,
        attributes: [
            {
                trait_type: "Duration",
                value: metadata.duration.toString()
            }
        ]
    };

    try {
        const options = {
            pinataMetadata: {
                name: metadata.title
            }
        };
        const result = await pinata.pinJSONToIPFS(nftMetadata, options);
        console.log(`Metadatos subidos a IPFS con hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error("Error al subir metadatos:", error);
        throw error;
    }
}

async function main() {
    // Configuración del video
    const videoMetadata: VideoMetadata = {
        title: "Rocket",
        description: "This is a rocket video",
        duration: 300,
        fileName: "rocket2.mp4"
    };

    try {
        // Construir la ruta completa del video
        const videoPath = path.resolve('./assets', videoMetadata.fileName);

        // 1. Subir video
        console.log("Subiendo video...");
        const videoHash = await uploadToPinata(videoPath, "Video NFT");

        // 2. Crear y subir metadatos
        console.log("Creando y subiendo metadatos...");
        const metadataHash = await createAndUploadMetadata(
            videoHash,
            videoMetadata
        );

        // 3. Mintear el NFT
        console.log("Minteando el NFT...");
        const CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
        
        // Configurar el proveedor y firmante
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
        
        // Obtener el contrato
        const videoNFTArtifact = require("../artifacts/contracts/VideoNFT.sol/VideoNFT.json");
        const videoNFT = new ethers.Contract(
            CONTRACT_ADDRESS!,
            videoNFTArtifact.abi,
            wallet
        );

        const tx = await videoNFT.mintVideo(
            wallet.address, // dirección a la que se minteará el NFT
            `ipfs://${metadataHash}` // URI de los metadatos
        );

        console.log("Esperando confirmación de la transacción...");
        const receipt = await tx.wait();

        // Encontrar el ID del token del evento
        const event = receipt.logs.find(log => {
            try {
                const parsedLog = videoNFT.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                });
                return parsedLog?.name === "VideoMinted";
            } catch (e) {
                return false;
            }
        });

        if (event) {
            const parsedLog = videoNFT.interface.parseLog({
                topics: event.topics,
                data: event.data
            });
            const tokenId = parsedLog?.args[0];
            console.log(`¡NFT minteado exitosamente! Token ID: ${tokenId}`);
            console.log("\nResumen:");
            console.log(`Video IPFS: ipfs://${videoHash}`);
            console.log(`Metadata IPFS: ipfs://${metadataHash}`);
            console.log(`\nPuedes ver tu archivo en:`);
            console.log(`https://gateway.pinata.cloud/ipfs/${videoHash}`);
            console.log(`https://gateway.pinata.cloud/ipfs/${metadataHash}`);
        }

    } catch (error) {
        console.error("Error en el proceso:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });