#!/bin/bash

docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t slidewiki/importservice ./
docker push slidewiki/importservice
