import { ethers } from "ethers";
import * as dotenv from "dotenv";
import axios from "axios";
const fs = require('fs');
const path = require('path');
dotenv.config();

// Check if the process.env object is empty
if (!Object.keys(process.env).length) {
    throw new Error("process.env object is empty");
}

// Setup env variables
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
/// TODO: Hack
let chainId = 31337;

const avsDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../contracts/deployments/hello-world/${chainId}.json`), 'utf8'));
// Load core deployment data
const coreDeploymentData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../contracts/deployments/core/${chainId}.json`), 'utf8'));


const delegationManagerAddress = coreDeploymentData.addresses.delegation; // todo: reminder to fix the naming of this contract in the deployment file, change to delegationManager
const avsDirectoryAddress = coreDeploymentData.addresses.avsDirectory;
const reliabilityIndexServiceManagerAddress = avsDeploymentData.addresses.reliabilityIndexServiceManager;
const ecdsaStakeRegistryAddress = avsDeploymentData.addresses.stakeRegistry;



// Load ABIs
const delegationManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/IDelegationManager.json'), 'utf8'));
const ecdsaRegistryABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/ECDSAStakeRegistry.json'), 'utf8'));
const reliabilityIndexServiceManagerABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/ReliabilityIndexServiceManager.json'), 'utf8'));
const avsDirectoryABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abis/IAVSDirectory.json'), 'utf8'));

// Initialize contract objects from ABIs
const delegationManager = new ethers.Contract(delegationManagerAddress, delegationManagerABI, wallet);
const reliabilityIndexServiceManager = new ethers.Contract(reliabilityIndexServiceManagerAddress, reliabilityIndexServiceManagerABI, wallet);
const ecdsaRegistryContract = new ethers.Contract(ecdsaStakeRegistryAddress, ecdsaRegistryABI, wallet);
const avsDirectory = new ethers.Contract(avsDirectoryAddress, avsDirectoryABI, wallet);


const fetchFinancialWeight = async (taskName: number) => {
    try {
        // Convert `taskName` to hex, padded to 64 characters
        const infuraUrl = `https://sepolia.infura.io/v3/5f0840eed75d4be8bad7ee7011aa1c37`;
        const x_hex = taskName.toString(16).padStart(64, "0");
        const dataField = `0x8e7cb6e1${x_hex}`;

        // Construct the payload for Infura
        const payload = {
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
                {
                    to: "0x8Ff75b7E4217500C3497A5bb84C63075143c374c",
                    data: dataField
                },
                "latest"
            ],
            id: 1
        };

        // Send request to Infura
        const response = await axios.post(infuraUrl, payload, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.data && response.data.result) {
            // Convert the hex response to an integer value
            const hexValue = response.data.result;
            return parseInt(hexValue, 16);
        } else {
            throw new Error("Invalid response from Infura");
        }
    } catch (error) {
        console.error("Error fetching financialWeight:", error);
        throw error;
    }
};

const signAndRespondToTask = async (taskIndex: number, taskCreatedBlock: number, taskName: number) => {
    const financialWeight = await fetchFinancialWeight(taskName);
    const messageHash = ethers.solidityPackedKeccak256(["uint256", "uint256"], [taskName, financialWeight]);
    const messageBytes = ethers.getBytes(messageHash);
    const signature = await wallet.signMessage(messageBytes);

    console.log(`Signing and responding to task ${taskIndex}`);

    const operators = [await wallet.getAddress()];
    const signatures = [signature];
    const signedTask = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address[]", "bytes[]", "uint32"],
        [operators, signatures, ethers.toBigInt(await provider.getBlockNumber()-1)]
    );

    console.log(signedTask)

    const tx = await reliabilityIndexServiceManager.respondToTask(
        { blockNum: taskName, taskCreatedBlock: taskCreatedBlock },
        { referenceTaskIndex: taskIndex, financial_weight: financialWeight },
        signedTask
    );
    await tx.wait();
    console.log(`Responded to task.`);

    console.log('Reading values from contract')
    console.log('Address', await reliabilityIndexServiceManager.getAddress())
    console.log(await reliabilityIndexServiceManager.financialWeightMap(taskName))
};

const registerOperator = async () => {
    
    // Registers as an Operator in EigenLayer.
    try {
        const tx1 = await delegationManager.registerAsOperator({
            __deprecated_earningsReceiver: await wallet.address,
            delegationApprover: "0x0000000000000000000000000000000000000000",
            stakerOptOutWindowBlocks: 0
        }, "");
        await tx1.wait();
        console.log("Operator registered to Core EigenLayer contracts");
    } catch (error) {
        console.error("Error in registering as operator:", error);
    }
    
    const salt = ethers.hexlify(ethers.randomBytes(32));
    const expiry = Math.floor(Date.now() / 1000) + 3600; // Example expiry, 1 hour from now

    // Define the output structure
    let operatorSignatureWithSaltAndExpiry = {
        signature: "",
        salt: salt,
        expiry: expiry
    };

    // Calculate the digest hash, which is a unique value representing the operator, avs, unique value (salt) and expiration date.
    const operatorDigestHash = await avsDirectory.calculateOperatorAVSRegistrationDigestHash(
        wallet.address, 
        await reliabilityIndexServiceManager.getAddress(), 
        salt, 
        expiry
    );
    console.log(operatorDigestHash);
    
    // Sign the digest hash with the operator's private key
    console.log("Signing digest hash with operator's private key");
    const operatorSigningKey = new ethers.SigningKey(process.env.PRIVATE_KEY!);
    const operatorSignedDigestHash = operatorSigningKey.sign(operatorDigestHash);

    // Encode the signature in the required format
    operatorSignatureWithSaltAndExpiry.signature = ethers.Signature.from(operatorSignedDigestHash).serialized;

    console.log("Registering Operator to AVS Registry contract");

    
    // Register Operator to AVS
    // Per release here: https://github.com/Layr-Labs/eigenlayer-middleware/blob/v0.2.1-mainnet-rewards/src/unaudited/ECDSAStakeRegistry.sol#L49
    const tx2 = await ecdsaRegistryContract.registerOperatorWithSignature(
        operatorSignatureWithSaltAndExpiry,
        wallet.address
    );
    await tx2.wait();
    console.log("Operator registered on AVS successfully");
};

const monitorNewTasks = async () => {
    //console.log(`Creating new task "EigenWorld"`);
    //await reliabilityIndexServiceManager.createNewTask("EigenWorld");

    reliabilityIndexServiceManager.on("NewTaskCreated", async (taskIndex: number, task: any) => {
        console.log(`New task detected: ${task.blockNum}`);
        await signAndRespondToTask(taskIndex, task.taskCreatedBlock, task.blockNum);
    });

    console.log("Monitoring for new tasks...");
};

const main = async () => {
    await registerOperator();
    monitorNewTasks().catch((error) => {
        console.error("Error monitoring tasks:", error);
    });
};

main().catch((error) => {
    console.error("Error in main function:", error);
});