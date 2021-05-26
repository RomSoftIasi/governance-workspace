
function getAccountInfo(){
    const orgAcc = JSON.parse(require('fs').readFileSync('./stages/OrgAcc/orgAcc.json').toString());
    return {
        privateKey : orgAcc.privateKey,
        account : orgAcc.account
    }
}

function deployAnchoringSC(web3, contractName, contractArgs, callback) {
    let anchorInfo = getAnchoringSCInfo();
    let abi = anchorInfo.abi;
    let bin = anchorInfo.bytecode;

    let contract = new web3.eth.Contract(abi);
    sendTransaction(web3, contract.deploy({data: "0x" + bin, arguments: contractArgs}),(err, tr) => {
        if (err){
            return callback(err);
        }
        console.log('Contract mined : ', tr.contractAddress);
        const fs = require('fs');
        const anchoringInfo = JSON.parse(fs.readFileSync('./stages/deployAnchoringSC/anchoringSCInfo.json').toString());
        anchoringInfo.contractAddress = tr.contractAddress;
        fs.writeFileSync('./stages/deployAnchoringSC/anchoringSCInfo.json', JSON.stringify(anchoringInfo));
        callback(undefined, tr.contractAddress);
    });
}

function sendTransaction(web3, transaction, callback) {
    const accountInfo = getAccountInfo();
    transaction.estimateGas({from: accountInfo.account}).then(
        (estimatedGas) => {

            let options = {
                from: accountInfo.account,
                data: transaction.encodeABI(),
                gas : estimatedGas,
                "chainId": 1101
            };

            web3.eth.accounts.signTransaction(options, accountInfo.privateKey).then(
                (signedT) => {
                    let signedTransaction = signedT;
                    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction, (err, hash) => {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }
                        console.log('Received T receipt', hash);
                        waitForTransactionToFinish(web3, hash, callback);
                    });
                },
                (err) => {
                    console.log(err);
                    return callback(err);
                }
            );

        },

    );



}

function getAnchoringSCInfo(){
    const solc = require('solc');
    const sourceContract = require('fs').readFileSync('./anchoring-sc/anchoringSC.sol','utf8');
    const compilerInput = {
        language: 'Solidity',
        sources: {
            'anchoringSC.sol' : {
                content: sourceContract
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': [ '*' ]
                }
            }
        }

    };

    const output = JSON.parse(solc.compile(JSON.stringify(compilerInput)));
    const fs = require('fs');
    fs.writeFileSync('./stages/deployAnchoringSC/SCCompiled.json',JSON.stringify(output),{encoding:'utf8'});

    const bytecode = output.contracts["anchoringSC.sol"]["anchoringSC"].evm.bytecode.object;
    const abi = output.contracts["anchoringSC.sol"]["anchoringSC"].abi;

    fs.writeFileSync('./stages/deployAnchoringSC/anchoringSCInfo.json',JSON.stringify({abi: abi}),{encoding:'utf8'});
    return {abi, bytecode };
}

function waitForTransactionToFinish(web3, hash, callback) {
    console.log('waiting for transaction to finish');
    const receipt = () => {
        web3.eth.getTransactionReceipt(hash).then((tr) => {
                if (tr === null){
                    console.log('waiting for transaction to finish');
                    setTimeout( () => {
                        receipt();
                    }, 1000);
                    return;
                }
                console.log('Transaction finished : ',tr);

                callback(undefined, tr);
            },
            (err) => {
                    console.log(err);
                    return callback(err);
                }
        )
    }

    receipt();
}

function executeAnchoringSCDeployment() {
    const Web3 = require('web3');
    const web3 = new Web3('http://ref-quorum-node1:8545'); // your geth
    deployAnchoringSC(web3,"anchoringSC", [], (err, data) =>{
        if (err){
            console.log(err);
            return process.exit(1);
        }
        console.log(data)
    });

}

module.exports = {
    executeAnchoringSCDeployment
}

