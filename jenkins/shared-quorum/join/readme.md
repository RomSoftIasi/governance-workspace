# Join procedure:

All scripts are executed from the repository folder.

## Step 1

1. Add in the **_joindata_** directory the received genesis file.
2. Execute 
```shell
./join/generate-network.sh
```   

3. Execute 
```shell
./join/deploy-infrastructure-network.sh
```   


### BACKUP:
```
my-enodes.txt
my-node-service.txt
my-validators.txt
./k8s directory
```
### SHARE:
```
my-enodes.txt
my-node-service.txt
my-validators.txt
```

## Step 2

1. Add in the joindata directory the received files :
```
partners-enodes.txt
partners-validators.txt
```
2. Add in the joindata directory your own files :
```
my-enodes.txt
my-validators.txt
```
3. Execute
```shell
./join/operate-join.sh
```

