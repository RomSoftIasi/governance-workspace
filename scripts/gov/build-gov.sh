. ./jenkins/modules/scripts/.env


echo "Build and push Governance docker image"
docker build --no-cache -t "$GOV_DOCKER_IMAGE":"$GOV_DOCKER_IMAGE_VERSION" -f ./docker/dev/Dockerfile .
docker tag "$GOV_DOCKER_IMAGE":"$GOV_DOCKER_IMAGE_VERSION" "$POD_DOCKER_REPOSITORY":"$GOV_DOCKER_IMAGE"_"$GOV_DOCKER_IMAGE_VERSION"
docker push "$POD_DOCKER_REPOSITORY":"$GOV_DOCKER_IMAGE"_"$GOV_DOCKER_IMAGE_VERSION"
