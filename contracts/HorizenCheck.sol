// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./RPToken.sol";
contract HorizenCheck{

    RPToken public immutable rp;
    constructor(RPToken _rp){
        rp = _rp;
    }

    function checker()
        external
        pure
        returns (bool canExec, bytes memory execPayload)
    {

        canExec = true;
        uint256 amount = 250;
        execPayload = abi.encodeCall(RPToken.mint, (amount) );
    }
}