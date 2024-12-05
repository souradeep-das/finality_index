<img width="1156" alt="Screenshot 2024-11-15 at 7 34 29 PM" src="https://github.com/user-attachments/assets/00dd78c8-643b-424e-99c4-cfd4b523b2d9">


# ReliaBlocks: On-chain reliability index for non-finalized blocks in Optimistic Rollups
**Built for EthGlobal Bangkok by Souradeep Das, Ethan Lam, Varun Vaidya, Sanjay Amirthraj**

An on-chain reliability index for non-finalized blocks in Optimistic Rollups to help non-validators estimate the likelihood of a non-finalized block being finalized. Such an index would provide valuable information to users without having to trust a specific entity or a validator for the information. A dynamic score, instead of a binary final/non-final answer - also helps put a number/weight to the reliability of what multiple agents are thinking about the finality of a specific block. An on-chain reliability index for non-finalized blocks in Optimistic Rollups would greatly enhance user experience by reducing uncertainty and improving risk assessment for transactions.

## Components 

 - Layer AVS WASMI component ([layer-avs/](https://github.com/souradeep-das/finality_index/tree/main/layer-avs))
 - Eigen Layer AVS component (root)
 - Eigen Layer Solidity smart contracts that work with the AVS component ([contracts/](https://github.com/souradeep-das/finality_index/tree/main/contracts))
 - UI dashboard illustrating the reliability score and a derived interest rate for further utilization. ([frontend/](https://github.com/souradeep-das/finality_index/tree/main/frontend))


<img width="1449" alt="Screenshot 2024-11-15 at 6 09 20 PM 2" src="https://github.com/user-attachments/assets/929765e5-4d80-4b71-b60f-685f62a91b41">


## Test Locally

1. Install deps using

```
   npm install
```

2. Start a test network using

```
npm run start:anvil  
```

3. To build the project, deploy contracts and run the operator

```
npm run build
npm run deploy:core
npm run deploy:finality_index
npm run extract:abis
npm run start:operator
```

4. Once, the operator is running -

```
npm run start:traffic
```

5. To build up the UI

```
cd frontend
npm i
npm run dev
```

## Running Layer's WASI component
1. After deploying Verifier, Operator contracts on Layer, to test the wasi interface, run:
```
 avs-toolkit-cli wasmatic run \                                              (base) 
         --wasm-source ./target/wasm32-wasip1/release/finality_index.wasm  \
         --envs "API_KEY=<your infura API key>" --input '{"x": <optimism-block-number>}'
```
