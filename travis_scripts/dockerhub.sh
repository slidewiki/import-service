#!/bin/bash

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t slidewiki/importservice:latest-dev ./
docker push slidewiki/importservice:latest-dev
