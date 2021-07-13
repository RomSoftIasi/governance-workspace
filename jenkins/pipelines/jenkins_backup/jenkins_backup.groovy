      podTemplate(
          containers: [
              containerTemplate(name: 'node', image: 'node:latest', ttyEnabled: true, command: 'cat')
              ]
          ){

            podTemplate(serviceAccount: 'jdefaultmns',namespace: 'jenkins',containers: [
                  containerTemplate(name: 'kubectl', image: 'public.ecr.aws/n4q1q0z2/pharmaledger-kubectl-jenkins-agent:1.0', command: 'cat', ttyEnabled: true)
                ],
                volumes: [
                  hostPathVolume(mountPath: '/var/run/docker.sock', hostPath: '/var/run/docker.sock')
                ]){

                      node(POD_LABEL){

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
                                sh 'TODO : wait until container is completed'
                                sh 'sleep 10m'
                            }
                        }


                        stage ('Backup finished. Clean up'){
                            container('kubectl'){
//                                sh 'cd governance-workspace/jenkins/docker/backup && kubectl delete -f . -n jenkins'
                            }
                        }

                      }
                }
          }
