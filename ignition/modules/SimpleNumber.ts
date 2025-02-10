import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleNumberModule = buildModule("SimpleNumberModule", (m) => {
    const simpleNumber = m.contract("SimpleNumber");
    
    return { simpleNumber };
});

export default SimpleNumberModule; 