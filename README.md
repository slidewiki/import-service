# Import Microservice #
[![Build Status](https://travis-ci.org/slidewiki/import-service.svg?branch=master)](https://travis-ci.org/slidewiki/import-service)
[![License](https://img.shields.io/badge/License-MPL%202.0-green.svg)](https://github.com/slidewiki/import-service/blob/master/LICENSE)
[![Language](https://img.shields.io/badge/Language-Javascript%20ECMA2015-lightgrey.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Framework](https://img.shields.io/badge/Framework-NodeJS%206.4.0-blue.svg)](https://nodejs.org/)
[![Webserver](https://img.shields.io/badge/Webserver-Hapi%2014.1.0-blue.svg)](http://hapijs.com/)
[![LinesOfCode](https://img.shields.io/badge/LOC-676-lightgrey.svg)](https://github.com/slidewiki/import-service/blob/master/application/package.json)
[![Coverage Status](https://coveralls.io/repos/github/slidewiki/import-service/badge.svg?branch=master)](https://coveralls.io/github/slidewiki/import-service?branch=master)

This repository handles import of presentation files (only PPTX for now) which are transformed to appropiate HTML for creation of deck and slides (sent to deck-service).

The PPTX2HTML library is used for parsing the PPTX (powerpoint presentation format) to HTML.
See (https://github.com/g21589/PPTX2HTML) on Github, and see (http://g21589.github.io/PPTX2HTML/#) for a demo.

You want to **check out this cool service**? Simply start the service and head over to: [http://localhost:3000/documentation](http://localhost:3000/documentation). We're using  [swagger](https://www.npmjs.com/package/hapi-swagger) to have this super cool API discovery/documentation tool.

### Use Docker to run/test your application ###
---
You can use [Docker](https://www.docker.com/) to build, test and run your application locally. Simply edit the Dockerfile and run:

```
docker build -t MY_IMAGE_TAG ./
docker run -it --rm -p 8880:3000 MY_IMAGE_TAG
```

Alternatively you can use [docker-compose](https://docs.docker.com/compose/) to run your application in conjunction with a (local) mongodb instance. Simply execute:

```
docker-compose up -d
```

### Install NodeJS ###
---
Please visit the wiki at [**Install NodeJS**](https://github.com/slidewiki/microservice-template/wiki/Install-NodeJS).
