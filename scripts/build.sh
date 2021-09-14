if [ "$1" = '' ]
then
  echo ''
  echo '--help for help information'
  echo ''
  exit 0
fi

if [ "$1" = '--help' ]
then
  echo ''
  echo 'Help for build.sh'
  echo ''
  echo 'aws            Creates the aws-config secret in order to be used by Jenkins docker pipelines and executes the docker login in order to push docker images'
  echo '--build-all    Build and push docker images for Governance and Jenkins agents '
  echo '--deploy-all   Deploy Jenkins and Governance '
  echo '--clean-all    Remove Jenkins and Governance installations'
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
  esac
done



