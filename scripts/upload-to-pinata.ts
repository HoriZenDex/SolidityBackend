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
    thumbnailName: string;
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
    thumbnailHash: string, 
    metadata: VideoMetadata
) {
    const nftMetadata = {
        name: metadata.title,
        description: metadata.description,
        image: `ipfs://${thumbnailHash}`,
        animation_url: `ipfs://${videoHash}`,
        attributes: [
            {
                trait_type: "Duration",
                value: metadata.duration.toString()
            }
        ]
    };

    try {
        const result = await pinata.pinJSONToIPFS(nftMetadata);
        console.log(`Metadatos subidos a IPFS con hash: ${result.IpfsHash}`);
        return result.IpfsHash;
    } catch (error) {
        console.error("Error al subir metadatos:", error);
        throw error;
    }
}

async function main() {
    // Verificar que las credenciales se están leyendo correctamente
    console.log('API Key length:', process.env.PINATA_API_KEY?.length);
    console.log('Secret Key length:', process.env.PINATA_SECRET_KEY?.length);
    
    // Configuración del video
    const videoMetadata: VideoMetadata = {
        title: "Mi Video NFT",
        description: "Este es mi primer video NFT subido a IPFS",
        duration: 300,
        fileName: "horse.mp4",
        thumbnailName: "akira.jpg"
    };

    try {
        // Obtener la ruta absoluta del directorio raíz del proyecto
        const projectRoot = path.resolve(__dirname, '..');
        const assetsDir = path.join(projectRoot, 'assets');
        
        // Verificar si existe el directorio assets
        if (!fs.existsSync(assetsDir)) {
            throw new Error(`El directorio assets no existe en: ${assetsDir}`);
        }
        
        console.log('Directorio assets encontrado en:', assetsDir);
        
        // Construir las rutas completas
        const videoPath = path.resolve('./assets', videoMetadata.fileName);
        const thumbnailPath = path.resolve('./assets', videoMetadata.thumbnailName);
        
        // Verificar la existencia de los archivos individualmente
        if (!fs.existsSync(videoPath)) {
            throw new Error(`El archivo de video no existe en: ${videoPath}`);
        }
        
        if (!fs.existsSync(thumbnailPath)) {
            throw new Error(`El archivo de thumbnail no existe en: ${thumbnailPath}`);
        }
        
        console.log('Archivos encontrados:');
        console.log('- Video:', videoPath);
        console.log('- Thumbnail:', thumbnailPath);

        // 1. Subir video
        console.log("Subiendo video...");
        const videoHash = await uploadToPinata(videoPath, "Video NFT2");

        // 2. Subir thumbnail
        console.log("Subiendo thumbnail...");
        const thumbnailHash = await uploadToPinata(thumbnailPath, "Video NFT Thumbnail2");

        // 3. Crear y subir metadatos
        console.log("Creando y subiendo metadatos...");
        const metadataHash = await createAndUploadMetadata(
            videoHash,
            thumbnailHash,
            videoMetadata
        );

        // 4. Mintear el NFT
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
            videoMetadata.title,
            videoMetadata.description,
            videoMetadata.duration,
            `ipfs://${metadataHash}`
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
            const tokenId = parsedLog?.args[0]; // El tokenId suele ser el primer argumento
            console.log(`¡NFT minteado exitosamente! Token ID: ${tokenId}`);
            console.log("\nResumen:");
            console.log(`Video IPFS: ipfs://${videoHash}`);
            console.log(`Thumbnail IPFS: ipfs://${thumbnailHash}`);
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