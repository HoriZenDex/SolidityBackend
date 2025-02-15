// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VideoNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Estructura para almacenar los metadatos del video
    struct VideoMetadata {
        string title;
        string description;
        uint256 duration;
        uint256 uploadDate;
        address creator;
    }


    // Mapping para almacenar los metadatos de cada token
    mapping(uint256 => VideoMetadata) public videos;

    // Eventos
    event VideoMinted(uint256 indexed tokenId, address indexed creator, string title);
    event VideoMetadataUpdated(uint256 indexed tokenId, string title, string description);
    event TokenURIUpdated(uint256 indexed tokenId, string newUri);

    error EmptyString();
    error InvalidDuration();
    error InvalidTokenURI();
    error NotTokenOwner();

    constructor() ERC721("CelestiaVideoNFT", "CVNFT") Ownable(msg.sender) {}

    // Función para mintear un nuevo video NFT
    function mintVideo(
        string calldata title,
        string calldata description,
        uint256 duration,
        string calldata uri
    ) public returns (uint256) {
        if (bytes(title).length == 0) revert EmptyString();
        if (bytes(description).length == 0) revert EmptyString();
        if (bytes(uri).length == 0) revert InvalidTokenURI();
        if (duration == 0) revert InvalidDuration();

        uint256 tokenId = _nextTokenId++;
        _safeMint(_msgSender(), tokenId);
        _setTokenURI(tokenId, uri);

        videos[tokenId] = VideoMetadata({
            title: title,
            description: description,
            duration: duration,
            uploadDate: block.timestamp,
            creator: _msgSender()
        });

        // emit VideoMinted(tokenId, _msgSender(), title);
        return tokenId;
    }

    // Nueva función para actualizar el URI del token
    function updateTokenURI(uint256 tokenId, string calldata newUri) public {
        if (ownerOf(tokenId) != _msgSender()) revert NotTokenOwner();
        if (bytes(newUri).length == 0) revert InvalidTokenURI();
        
        _setTokenURI(tokenId, newUri);
        emit TokenURIUpdated(tokenId, newUri);
    }

    // Función para actualizar los metadatos del video
    function updateVideoMetadata(
        uint256 tokenId,
        string calldata newTitle,
        string calldata newDescription
    ) public {
        if (ownerOf(tokenId) != _msgSender()) revert NotTokenOwner();
        if (bytes(newTitle).length == 0) revert EmptyString();
        if (bytes(newDescription).length == 0) revert EmptyString();
        
        VideoMetadata storage video = videos[tokenId];
        video.title = newTitle;
        video.description = newDescription;

        emit VideoMetadataUpdated(tokenId, newTitle, newDescription);
    }

    // Función para obtener los metadatos completos de un video
    function getVideoMetadata(uint256 tokenId) public view returns (
        string memory title,
        string memory description,
        uint256 duration,
        uint256 uploadDate,
        address creator
    ) {
        VideoMetadata memory video = videos[tokenId];
        return (
            video.title,
            video.description,
            video.duration,
            video.uploadDate,
            video.creator
        );
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}