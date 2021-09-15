. ./jenkins/modules/scripts/.env


echo "Build Jenkins Agents"
echo "Building kubectl jenkins agent docker image"

docker build --no-cache -t "$KUBECTL_JENKINS_DOCKER_IMAGE":"$KUBECTL_JENKINS_DOCKER_IMAGE_VERSION" -f ./jenkins/docker/kubectl/Dockerfile .
docker tag "$KUBECTL_JENKINS_DOCKER_IMAGE":"$KUBECTL_JENKINS_DOCKER_IMAGE_VERSION" "$POD_DOCKER_REPOSITORY":"$KUBECTL_JENKINS_DOCKER_IMAGE"_"$KUBECTL_JENKINS_DOCKER_IMAGE_VERSION"
docker push "$POD_DOCKER_REPOSITORY":"$KUBECTL_JENKINS_DOCKER_IMAGE"_"$KUBECTL_JENKINS_DOCKER_IMAGE_VERSION"

echo "Finished Build kubectl jenkins agent docker image"


echo "Building docker-aws jenkins agent docker image"

docker build --no-cache -t "$DOCKER_AWS_JENKINS_DOCKER_IMAGE":"$DOCKER_AWS_JENKINS_DOCKER_IMAGE_VERSION" -f ./jenkins/docker/docker-aws/Dockerfile .
docker tag "$DOCKER_AWS_JENKINS_DOCKER_IMAGE":"$DOCKER_AWS_JENKINS_DOCKER_IMAGE_VERSION" "$POD_DOCKER_REPOSITORY":"$DOCKER_AWS_JENKINS_DOCKER_IMAGE"_"$DOCKER_AWS_JENKINS_DOCKER_IMAGE_VERSION"
docker push "$POD_DOCKER_REPOSITORY":"$DOCKER_AWS_JENKINS_DOCKER_IMAGE"_"$DOCKER_AWS_JENKINS_DOCKER_IMAGE_VERSION"

echo "Finished Build docker-aws jenkins agent docker image"
