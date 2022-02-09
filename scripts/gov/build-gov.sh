. ./scripts/.env


echo "Build and push Governance docker image"
docker build --no-cache --build-arg GHCODE="$GITHUB_REPO_TOKEN" -t "$GOV_DOCKER_IMAGE":"$GOV_DOCKER_IMAGE_VERSION" -f ./docker/Dockerfile .
docker tag "$GOV_DOCKER_IMAGE":"$GOV_DOCKER_IMAGE_VERSION" "$POD_DOCKER_REPOSITORY"/"$GOV_DOCKER_IMAGE":"$GOV_DOCKER_IMAGE_VERSION"
docker push "$POD_DOCKER_REPOSITORY"/"$GOV_DOCKER_IMAGE":"$GOV_DOCKER_IMAGE_VERSION"
