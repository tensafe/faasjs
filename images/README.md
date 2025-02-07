# FaasJS's Docker Images

## Images

### [faasjs/nginx](https://faasjs.com/doc/images/nginx)

A Nginx Image for FaasJS projects.

[![faasjs/nginx](https://img.shields.io/badge/Docker-faasjs%2Fnginx-blue)](https://hub.docker.com/r/faasjs/nginx)
[![Image size](https://img.shields.io/docker/image-size/faasjs/nginx/latest)](https://hub.docker.com/r/faasjs/nginx)
[![Build faasjs/nginx](https://github.com/faasjs/faasjs/actions/workflows/build-nginx-image.yml/badge.svg)](https://github.com/faasjs/faasjs/actions/workflows/build-nginx-image.yml)

### [faasjs/node](https://faasjs.com/doc/images/node)

Node Image for FaasJS projects.

[![faasjs/node](https://img.shields.io/badge/Docker-faasjs%2Fnode-blue)](https://hub.docker.com/r/faasjs/node)
[![Image size](https://img.shields.io/docker/image-size/faasjs/node/latest)](https://hub.docker.com/r/faasjs/node)
[![Build faasjs/node](https://github.com/faasjs/faasjs/actions/workflows/build-node-image.yml/badge.svg)](https://github.com/faasjs/faasjs/actions/workflows/build-node-image.yml)

### [faasjs/vscode](https://faasjs.com/doc/images/vscode)

VSCode Container Image for FaasJS projects.

[![faasjs/vscode](https://img.shields.io/badge/Docker-faasjs%2Fvscode-blue)](https://hub.docker.com/r/faasjs/vscode)
[![Image size](https://img.shields.io/docker/image-size/faasjs/vscode/latest)](https://hub.docker.com/r/faasjs/vscode)
[![Build faasjs/vscode](https://github.com/faasjs/faasjs/actions/workflows/build-vscode-image.yml/badge.svg)](https://github.com/faasjs/faasjs/actions/workflows/build-vscode-image.yml)

## Tips for using in China

### Use Aliyun mirror

```
# For alpine
sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# For npm
npm config set registry https://registry.npmmirror.com/
```
