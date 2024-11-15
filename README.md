# ReliaBlocks: On-chain reliability index for non-finalized blocks in Optimistic Rollups

An on-chain reliability index for non-finalized blocks in Optimistic Rollups to help non-validators estimate the likelihood of a non-finalized block being finalized. Such an index would provide valuable information to users without having to trust a specific entity or a validator for the information. A dynamic score, instead of a binary final/non-final answer - also helps put a number/weight to the reliability of what multiple agents are thinking about the finality of a specific block. An on-chain reliability index for non-finalized blocks in Optimistic Rollups would greatly enhance user experience by reducing uncertainty and improving risk assessment for transactions.

## Components 

 - Layer AVS WASMI component (layer-avs/)
 - Eigen Layer AVS component (root)
 - Eigen Layer Solidity smart contracts that work with the AVS component (contracts/)
 - UI dashboard illustrating the reliability score and a derived interest rate for further utilization. (frontend/)


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

