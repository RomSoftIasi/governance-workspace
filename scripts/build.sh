if [ "$1" = '' ]
then
  echo ''
  echo '--help for commands and flags details'
  echo ''
  exit 0
fi

if [ "$1" = '--help' ]
then
  echo ''
  echo 'Utility shell in order to help deploying Jenkins and Governance'
  echo 'Shell will be executed from the root of Governance repository'
  echo 'All customizations will be done in the already existing files from ./jenkins/modules directory and will be integrated in current execution automatically'
  echo 'Please review and customize as needed the ENVIRONMENT VARIABLES defined in ./jenkins/modules/scripts/.env'
  echo ''
  echo 'Help for build.sh'
  echo ''
  echo '--env-legend            Show greater descriptions for the defined environment variables '
  echo 'aws                     Creates the aws-config secret in order to be used by Jenkins docker pipelines and executes the docker login in order to push docker images'
  echo '--build-all             Build and push docker images for Governance and Jenkins agents '
  echo '--deploy-all            Deploy Jenkins and Governance '
  echo '--clean-all             Remove Jenkins and Governance installations'
  echo '--cbd-gov               Clean,build and deploy the Governance'
  echo ''
  exit 0
fi

if [ "$1" == '--env-legend' ]
then
  echo ''
  echo 'ENVIRONMENT VARIABLES - LEGEND'
  echo ''
  echo 'AWS_ACCESS_KEY_ID : AWS ACCESS KEY ID'
  echo 'AWS_SECRET_ACCESS_KEY : AWS SECRET ACCESS KEY'
  echo 'DEFAULT_REGION : Default region to be used by the AWS login process'
  echo 'POD_DOCKER_REPOSITORY : The docker repository where all the docker images will be uploaded and from where will be used'
  echo ''
  echo 'GOVCONTAINERNAME : Governance deployment name'
  echo 'GOVAPPNAME : Governance container label name'
  echo 'GOV_DOCKER_IMAGE : Governance docker image name'
  echo 'GOV_DOCKER_IMAGE_VERSION : Governance docker image version. Currently is coded to gather the latest commit number and use it as a version'
  echo ''
  echo 'KUBECTL_JENKINS_DOCKER_IMAGE : The docker image name for the jenkins agent that require kubectl installed'
  echo 'KUBECTL_JENKINS_DOCKER_IMAGE_VERSION : The version for the jenkins agent with kubectl. Static value. Image is build only once when the Jenkins is deployed.'
  echo ''
  echo 'DOCKER_AWS_JENKINS_DOCKER_IMAGE : The docker image for the Jenkins agent that is responsible with building docker images and pushing them to the repository'
  echo 'DOCKER_AWS_JENKINS_DOCKER_IMAGE_VERSION : The version for the jenkins agent with docker and repository access. Static value. Image is build when Jenkins is deployed.'
  echo ''
  echo ''
  exit 0
fi


if [ "$1" = 'aws' ]
then
  ./jenkins/modules/scripts/configure_aws.sh --docker --jenkins-secret
else
  echo 'WARNING: aws command was not used. The rest of the operations will be done assuming the docker login was executed and the jenkins secret will be created after the Jenkins is deployed and before using any pipelines '
  echo ''
fi

for i in "$@"
do
  case $i in
    --build-all)
      ./scripts/gov/build-gov.sh
      ./scripts/jenkins/build-jenkins-agents.sh
      ;;
    --deploy-all)
      ./scripts/gov/deploy-gov.sh
      ./scripts/jenkins/deploy-jenkins.sh
      ;;
    --clean-all)
      ./scripts/gov/clean-gov.sh
      ./scripts/jenkins/clean-jenkins.sh
      ;;
    --cbd-gov)
      ./scripts/gov/clean-gov.sh
      ./scripts/gov/build-gov.sh
      sleep 1m
      ./scripts/gov/deploy-gov.sh
      ;;
  esac
done



