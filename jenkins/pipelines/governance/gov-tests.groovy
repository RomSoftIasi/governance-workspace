podTemplate(
  containers: [
      containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
      ]
  ){
      node(POD_LABEL){
        stage ('Build and Run Tests'){
            container('node'){
                sh 'git clone http://github.com/PrivateSky/privatesky.git'
                stage ('Build dev-install'){
                    sh 'cd privatesky && npm run dev-install'
                }
                stage ('Build'){
                    sh 'cd privatesky && npm run build'
                }

                try{
                    stage('Run tests'){
                        sh 'cd privatesky && npm run tests'
                    }
                }
                catch (err) {
                    unstable (message: "${STAGE_NAME} is unstable. Some tests are failing.")
                }
                finally {
                    archiveArtifacts artifacts: 'privatesky/testReport.html', fingerprint: true
                }
            }
        }

        // Once the testing is finished, trigger the next pipeline by name
        //stage ('Build docker images and publish'){
        //    build 'gov-docker'
        //}

      }
}






