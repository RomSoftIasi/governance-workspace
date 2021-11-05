
# Initiator manual deployment steps

1. Generate the initial nodes
```
./start/generate-network.sh
```

2. Use istanbul tools and update genesis file with extradata

3. Deploy the network
```shell
./start/deploy-network.sh
```


4. Access the node on localhost:8545 and deploy the smart contract
```shell
cd template
node ./stages/OrgAcc/stage.js
node ./stages/deployAnchoringSC/stage.js
cd..
```

#### Backup :
```shell
genesis file
my-enodes.txt
my-node-service.txt
my-validators.txt
UTC*
admAcc.json
orgAcc.json
anchoringSCInfo.json

```

#### Share :
```shell
genesis file
my-enodes.txt
my-node-service.txt
my-validators.txt
```

5. Collect connection files from the partners
6. Add in the joindata folder
```shell
partners-enodes.txt
partners-validators.txt
my-validators.txt
my-enodes.txt

```

7. Execute to add the nodes that will join as validators and as allowed connections
```shell
./start/operate-join.sh
```

