// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/Test.sol";
import {ReliabilityIndexDeploymentLib} from "./utils/ReliabilityIndexDeploymentLib.sol";
import {CoreDeploymentLib} from "./utils/CoreDeploymentLib.sol";
import {UpgradeableProxyLib} from "./utils/UpgradeableProxyLib.sol";
import {StrategyBase} from "@eigenlayer/contracts/strategies/StrategyBase.sol";
import {ERC20Mock} from "../test/ERC20Mock.sol";
import {TransparentUpgradeableProxy} from
    "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {StrategyFactory} from "@eigenlayer/contracts/strategies/StrategyFactory.sol";
import {StrategyManager} from "@eigenlayer/contracts/core/StrategyManager.sol";


import {
    Quorum,
    StrategyParams,
    IStrategy
} from "@eigenlayer-middleware/src/interfaces/IECDSAStakeRegistryEventsAndErrors.sol";

contract ReliabilityIndexDeployer is Script {
    using CoreDeploymentLib for *;
    using UpgradeableProxyLib for address;

    address private deployer;
    address proxyAdmin;
    IStrategy reliabilityIndexStrategy;
    CoreDeploymentLib.DeploymentData coreDeployment;
    ReliabilityIndexDeploymentLib.DeploymentData reliabilityIndexDeployment;
    Quorum internal quorum;
    ERC20Mock token;
    function setUp() public virtual {
        deployer = vm.rememberKey(vm.envUint("PRIVATE_KEY"));
        vm.label(deployer, "Deployer");

        coreDeployment = CoreDeploymentLib.readDeploymentJson("deployments/core/", block.chainid);
       
        token = new ERC20Mock();
        reliabilityIndexStrategy = IStrategy(StrategyFactory(coreDeployment.strategyFactory).deployNewStrategy(token));

        quorum.strategies.push(
            StrategyParams({strategy: reliabilityIndexStrategy, multiplier: 10_000})
        );
    }

    function run() external {
        vm.startBroadcast(deployer);
        proxyAdmin = UpgradeableProxyLib.deployProxyAdmin();

        reliabilityIndexDeployment =
            ReliabilityIndexDeploymentLib.deployContracts(proxyAdmin, coreDeployment, quorum);

        reliabilityIndexDeployment.strategy = address(reliabilityIndexStrategy);
        reliabilityIndexDeployment.token = address(token);
        vm.stopBroadcast();

        verifyDeployment();
        ReliabilityIndexDeploymentLib.writeDeploymentJson(reliabilityIndexDeployment);
    }

    function verifyDeployment() internal view {
        require(
            reliabilityIndexDeployment.stakeRegistry != address(0), "StakeRegistry address cannot be zero"
        );
        require(
            reliabilityIndexDeployment.reliabilityIndexServiceManager != address(0),
            "ReliabilityIndexServiceManager address cannot be zero"
        );
        require(reliabilityIndexDeployment.strategy != address(0), "Strategy address cannot be zero");
        require(proxyAdmin != address(0), "ProxyAdmin address cannot be zero");
        require(
            coreDeployment.delegationManager != address(0),
            "DelegationManager address cannot be zero"
        );
        require(coreDeployment.avsDirectory != address(0), "AVSDirectory address cannot be zero");
    }
}
