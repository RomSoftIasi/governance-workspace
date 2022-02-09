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


                        try{
                            stage ('Clean'){
                                container ('kubectl'){
                                    sh 'kubectl delete pod jenkins-backup -n jenkins'
                                }
                            }
                        }
                        catch (err){

                        }


                        stage ('Repository cloning'){
                            container('node'){
                                    sh 'git clone https://github.com/PharmaLedger-IMI/governance-workspace.git'
                                    sh 'cd governance-workspace/jenkins/docker/backup && sed "s,%GITHUB_USER%,${GITHUB_USER},g" jenkins-backup.yaml.template | sed "s,%GITHUB_USER_EMAIL%,${GITHUB_USER_EMAIL},g" | sed "s,%GITHUB_ACCESS_TOKEN%,${GITHUB_ACCESS_TOKEN},g" > jenkins-backup.yaml'
                                    sh 'cat governance-workspace/jenkins/docker/backup/jenkins-backup.yaml'
                            }
                        }

                        stage ('Deploy jenkins backup container'){
                            container('kubectl'){
                                sh 'cd governance-workspace/jenkins/docker/backup && kubectl apply -f . -n jenkins'
                                //sh 'sleep 5m'
                            }
                        }


                        stage ('Backup finished. Clean up'){
                            container('kubectl'){
                               // sh 'cd governance-workspace/jenkins/docker/backup && kubectl delete -f . -n jenkins'
                            }
                        }

                      }
                }
          }
