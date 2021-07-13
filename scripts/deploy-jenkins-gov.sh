
./scripts/configure_aws.sh

echo "Deployment will use already generated images"
./scripts/deploy-jenkins.sh

echo "Build latest version for governance"
./scripts/build-gov.sh

./scripts/deploy-gov.sh
