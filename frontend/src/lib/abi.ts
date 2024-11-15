export const abi = [
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "blocknums",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "weights",
                "type": "uint256[]"
            }
        ],
        "name": "assignWeigths",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "financialWeightMap",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "blockNum",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_latestBlock",
                "type": "uint256"
            }
        ],
        "name": "getIndex",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;


export const address = "0x5C2d1dA7F6d86b719aA7D73780566BC376Df67fA";