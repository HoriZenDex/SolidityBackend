// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VideoNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Eventos
    event VideoMinted(uint256 indexed tokenId, address indexed creator, string title);

    error InvalidTokenURI();
    error InvalidMarketplaceAddress();

    constructor() ERC721("CelestiaVideoNFT", "CVNFT") Ownable(msg.sender) {}

    // Función para mintear un nuevo video NFT
    function mintVideo(
        address to,
        string calldata uri
    ) public returns (uint256) {
        if (bytes(uri).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit VideoMinted(tokenId, to, uri);
        return tokenId;
    }

    // Función auxiliar para aprobar un marketplace para todos tus tokens
    function approveMarketplace(address marketplace, bool approved) external {
        if (marketplace == address(0)) revert InvalidMarketplaceAddress();
        setApprovalForAll(marketplace, approved);
    }
}