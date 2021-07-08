podTemplate(serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
      containerTemplate(name: 'kubectl', image: 'public.ecr.aws/n4q1q0z2/pharmaledger-kubectl-jenkins-agent:1.0', command: 'cat', ttyEnabled: true)
    ],
    volumes: [
      hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
    ]){
        node (POD_LABEL){

            stage ('Cleanup usecase installation'){
                container('kubectl'){
                    try{
                        stage('Remove deployment'){
                            sh 'kubectl delete deployments $subdomain -n default'
                        }
                    }
                    catch (err) {
                        unstable (message: "${STAGE_NAME} is unstable.")
                    }

                    try{
                        stage('Remove services'){
                            sh 'kubectl delete services $domain -n default'
                        }
                    }
                    catch (err) {
                        unstable (message: "${STAGE_NAME} is unstable.")
                    }

                    try{
                        stage('Remove config map'){
                            sh 'kubectl delete configmaps $subdomain -n default'
                        }
                    }
                    catch (err) {
                        unstable (message: "${STAGE_NAME} is unstable.")
                    }

                    try{
                        stage('Remove config map'){
                             sh 'kubectl delete configmaps domains-$subdomain -n default'
                        }
                    }
                    catch (err) {
                        unstable (message: "${STAGE_NAME} is unstable.")
                    }

                    try{
                        stage('Remove config map'){
                            sh 'kubectl get deployments -n default'
                            sh 'kubectl get pods  -n default'
                            sh 'kubectl get services -n default'
                            sh 'kubectl get configmaps -n default'
                        }
                    }
                    catch (err) {
                        unstable (message: "${STAGE_NAME} is unstable.")
                    }



                }
            }

        }


    }
