podTemplate(
  containers: [
      containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
      ]
  ){
      node(POD_LABEL){
        stage ('Build and Install ETH anchring smart contract'){
            container('node'){
                sh 'git clone https://github.com/PharmaLedger-IMI/ethereum-anchoring.git'
                stage ('Build dev-install'){
                    sh 'cd ethereum-anchoring/SmartContract && npm install --unsafe-perm'
                }
                stage ('Build'){
                    sh 'cd ethereum-anchoring/SmartContract && export ACCOUNT="0x45367b46448A7740C3EB35Cb0c3609e309f914F4"; export RPC_HOST="172.20.24.59"; npx truffle migrate'
                }

            }
        }


      }
}






