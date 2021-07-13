. ./scripts/.env


echo "Build Governance docker image"
docker build --no-cache -t pharmaledger-governance:"$DOCKERIMAGEVERSION" -f ./docker/Dockerfile .
docker tag pharmaledger-governance:"$DOCKERIMAGEVERSION" public.ecr.aws/n4q1q0z2/pharmaledger-governance:"$DOCKERIMAGEVERSION"
docker push public.ecr.aws/n4q1q0z2/pharmaledger-governance:"$DOCKERIMAGEVERSION"
