import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VideoNFTModule = buildModule("VideoNFTModule", (m) => {
  // Deploy el contrato principal
  const videoNFT = m.contract("VideoNFT");

  // Mintear el video pero no retornarlo
  m.call(videoNFT, "mintVideo", [
    "Video de prueba", // título
    "Esta es una descripción de prueba", // descripción
    300, // duración en segundos (5 minutos)
    "ipfs://QmExample..." // URI del token (reemplaza con un URI real)
  ]);

  return { videoNFT };  // Solo retornamos el contrato
});

export default VideoNFTModule; 