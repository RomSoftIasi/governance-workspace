//Jenkins env variable
//$POD_DOCKER_REPOSITORY
//$KUBECTL_JENKINS_AGENT
//$KUBECTL_JENKINS_AGENT_VERSION


def kubectl_image_source = "$POD_DOCKER_REPOSITORY"+'/'+"$KUBECTL_JENKINS_AGENT"+':'+"$KUBECTL_JENKINS_AGENT_VERSION"

  podTemplate(
      containers: [
          containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
          ]
      ){

        podTemplate(serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
              containerTemplate(name: 'kubectl', image: kubectl_image_source, command: 'cat', ttyEnabled: true)
            ],
            volumes: [
              hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
            ]){

                  node(POD_LABEL){

                    stage ('Repository cloning'){
                        container('node'){
                            sh 'git clone $usecaseRepository'
                        }
                    }

                    stage ('Customize build'){
                        container('node'){
                            stage ('Configure config-map'){
                                sh 'cd $workspace/docker/k8s/templates && sed "s/%domain%/$domain/g" configmap.yaml.template | sed "s/%bdns-entries%//g" | sed "s/%subdomain%/$subdomain/g" | sed "s/%vaultdomain%/$vaultdomain/g" > configmap.yaml'
                                sh 'cat $workspace/docker/k8s/templates/configmap.yaml'

                                sh 'cd $workspace/docker/k8s/templates && sed "s/%domain%/$domain/g" domains-configmap.yaml.template | sed "s/%subdomain%/$subdomain/g" | sed "s/%vaultdomain%/$vaultdomain/g" | sed "s/%anchoring%/FS/g" | sed "s/%anchoringEndPoint%/\\"enableBricksLedger\\": false/g" > domains-configmap.yaml'
                                sh 'cat $workspace/docker/k8s/templates/domains-configmap.yaml'
                            }
                            stage ('Configure deployment'){
                                script{
                                     usecase_version = sh(  returnStdout: true, script: 'cd $workspace && git log -n 1 --format="%H"').trim()
                                }
                                sh "cd $workspace/docker/k8s/templates && sed 's/%domain%/$domain/g' deployment.yaml.template | sed 's/%subdomain%/$subdomain/g' | sed 's/%vaultdomain%/$vaultdomain/g' | sed 's|%POD_DOCKER_REPOSITORY%|$POD_DOCKER_REPOSITORY|g' | sed 's|%ORGANISATION__DEPLOYMENT_PREFIX%|$ORGANISATION__DEPLOYMENT_PREFIX|g' | sed 's|%usecase_version%|$usecase_version|g' > deployment.yaml"
                                sh 'cat $workspace/docker/k8s/templates/deployment.yaml'

                                sh 'cd $workspace/docker/k8s/templates && sed "s/%subdomain%/$subdomain/g" service.yaml.template | sed "s/%domain%/$domain/g" > service.yaml'
                                sh 'cat $workspace/docker/k8s/templates/service.yaml'

                            }
                        }
                    }

                    stage ('Build and publish docker Image'){

                        def docker_image = "${ORGANISATION__DEPLOYMENT_PREFIX}-${domain}"
                        def dockerfile = readFile("${workspace}/docker/Dockerfile")
                        build job: 'build-and-push-docker-image',
                        parameters: [
                                string(name: 'DATA_IMAGE_NAME', value:"$docker_image"),
                                string(name: 'DATA_IMAGE_VERSION', value:"$usecase_version"),
                                base64File(name: 'dockerfile', base64: Base64.encoder.encodeToString(dockerfile.bytes))
                                ]
                    }

                   stage ('Usecase deployment'){
                       container('kubectl'){
                             sh 'cd $workspace/docker && kubectl apply -f ./k8s/templates -n default'
                             sh 'kubectl get pods -n default'
                             sh 'kubectl get services -n default'
                        }
                    }


                  }

            }
    }

