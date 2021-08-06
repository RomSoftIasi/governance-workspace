podTemplate(
    containers: [
        containerTemplate(name: 'docker', image: 'public.ecr.aws/n4q1q0z2/pharmaledger-docker-aws-jenkins-agent:1.0',alwaysPullImage:true , ttyEnabled: true, command: 'cat')
    ],
    volumes: [hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')],
    envVars: [secretEnvVar(key: 'aws_key_id', secretName: 'aws-config', secretKey: 'aws_key_id'),
              secretEnvVar(key: 'aws_access_key', secretName: 'aws-config', secretKey: 'aws_access_key')
             ]
  ){


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
                                sh 'git clone $usecaseRepository'
                            }
                        }

                        stage ('Customize build'){
                            container('node'){
                                stage ('Configure config-map'){
                                    sh 'cd $workspace/docker/k8s/templates && sed "s/%domain%/$domain/g" configmap.yaml.template | sed "s/%bdns-entries%//g" | sed "s/%subdomain%/$subdomain/g" | sed "s/%vaultdomain%/$vaultdomain/g" > configmap.yaml'
                                    sh 'cat $workspace/docker/k8s/templates/configmap.yaml'

                                    sh 'cd $workspace/docker/k8s/templates && sed "s/%domain%/$domain/g" domains-configmap.yaml.template | sed "s/%subdomain%/$subdomain/g" | sed "s/%vaultdomain%/$vaultdomain/g" | sed "s/%anchoring%/ETH/g" | sed "s/%anchoringEndPoint%/\\"endpoint\\": \\"http:\\/\\/ehtadapter-service:3000\\"/g" > domains-configmap.yaml'
                                    sh 'cat $workspace/docker/k8s/templates/domains-configmap.yaml'
                                }
                                stage ('Configure deployment'){
                                    sh 'cd $workspace/docker/k8s/templates && sed "s/%domain%/$domain/g" deployment.yaml.template | sed "s/%subdomain%/$subdomain/g" | sed "s/%vaultdomain%/$vaultdomain/g" > deployment.yaml'
                                    sh 'cat $workspace/docker/k8s/templates/deployment.yaml'

                                    sh 'cd $workspace/docker/k8s/templates && sed "s/%subdomain%/$subdomain/g" service.yaml.template | sed "s/%domain%/$domain/g" > service.yaml'
                                    sh 'cat $workspace/docker/k8s/templates/service.yaml'

                                }
                            }
                        }

                        stage ('Build and publish docker Image'){
                            container ('docker'){
                                sh 'aws --version'
                                sh 'aws configure set aws_access_key_id "$aws_key_id"'
                                sh 'aws configure set aws_secret_access_key "$aws_access_key"'
                                sh 'aws configure set default.region "$DEFAULT_REGION"'
                                sh 'aws configure set default.output \'NONE\''
                                sh 'aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n4q1q0z2'
                                sh 'cd $workspace/docker && docker build --no-cache --network host -t public.ecr.aws/n4q1q0z2/pharmaledger-$domain:1.0 .'
                                sh 'docker push public.ecr.aws/n4q1q0z2/pharmaledger-$domain:1.0'
                            }
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
    }
