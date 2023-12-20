> _其他语言版本：[简体中文](README.zh.md)_

## Flexible Classroom Electron App

## Fetch submodules
```bash
git submodule update --init --recursive packages/agora-classroom-sdk 
git submodule update --init --recursive packages/agora-proctor-sdk 
git submodule update --init --recursive packages/agora-plugin-gallery
```
## Install

```bash
# install all dependencies via lerna and npm
yarn bootstrap
```

## Config

```bash
# rename config template
cp .env.example .env

# fill the config with your agora.io development environment
```

## How to generate RtmToken using your own AppId and Secret

```bash
# If .env contains `REACT_APP_AGORA_APP_ID` and `REACT_APP_AGORA_APP_CERTIFICATE` configurations, the client will automatically generate an RTM Token for you
REACT_APP_AGORA_APP_ID=
REACT_APP_AGORA_APP_CERTIFICATE=
```

## Pack the Electron client

```bash
# create .env file in the root folder and copy all the keys from .env.example to .env file which you have created
copy .env.example contents to .env file which you created
# Build Web Resources
yarn build:demo
# Build a Windows client(Run `yarn build:demo` to build Web resources before pack electron)
yarn pack:electron:win
# Build a Mac client(Run `yarn build:demo` to build Web resources before pack electron)
yarn pack:electron:mac
# to make build use the below command "yarn pack:classroom:sdk" and not the above command eg electron mak or build demo
yarn pack:classroom:sdk

Find the output in packages/agora-classroom-sdk/lib/edu_sdk.bundle.js.
```
# Build a Mac client(Run `yarn build:demo` to build Web resources before pack electron)


## Run
```bash
# To run the use the below command
yarn dev
```

# For ENV Copy this
 ```bash
# copy the below and paste it in .env file
SKIP_PREFLIGHT_CHECK=true
ELECTRON_START_URL=http://localhost:3000
REACT_APP_BUILD_VERSION=TEST_APAAS_2.0.0
REACT_APP_AGORA_APP_SDK_DOMAIN=https://api.sd-rtn.com
REACT_APP_AGORA_APP_TOKEN_DOMAIN={ "prod_cn": "https://api-solutions-cn.agoralab.co", "prod_ap": "https://api-solutions-ap.agoralab.co", "prod_na": "https://api-solutions-na.agoralab.co", "prod_eu": "https://api-solutions-eu.agoralab.co" }
REACT_APP_SCENE_BUILDER_DOMAIN={ "prod_cn": "https://api-solutions-cn.agoralab.co", "prod_na": "https://api-solutions-na.agoralab.co" }
REACT_APP_AGORA_APP_ID= e62a4ee20e4841fc9583cca5cb2f32d0
REACT_APP_AGORA_APP_CERTIFICATE= 884bc8fa7a3848978e74beea0528f398
REACT_APP_SHARE_LINK_PREFIX=
REACT_APP_AGORA_APP_ASSETS_CDN=https://solutions-apaas.agora.io/static

 ```


