function executeStage(){
    require('./createAdmAcc').createAdmAcc((err) => {
        if (err){
            console.log(err);
            return process.exit(1);
        }
        require('./updateGenesisFile').updateGenesisFile();
        require('./updateQuorumKeyData').updateQuorumKeyData();
        console.log('Finished configuring the blockchain deployment files.')
    })
}


executeStage();
