# SSH-CONFIG

A cli util for managing ssh config.

## Installation

> npm install -g @c060604/ssh-config

## Usage

```
$ ssh-config -h
Usage: ssh-config [options] [command]

Options:
  -V, --version      output the version number
  -h, --help         output usage information

Commands:
  set-proxy <proxy>  setup proxy
  add [options]      add ssh config
  delete [options]   delete ssh config
  ls                 list all configs
  remove-all         remove all configs
```

### Set Default Proxy

> ssh-config set-proxy 127.0.0.1:1080

### Add Remote Host

```
$ ssh-config add -h
Usage: add [options]

add ssh config

Options:
  -H, --host <host>    Which host to request
  -u, --user <user>    Which user to login
  -p, --proxy <proxy>  Which proxy to use
  -h, --help           output usage information

Example:

  $ ssh-config add -h github.com -u git
  $ ssh-config add -h github.com -u git -p 127.0.0.1:1086
```

It will add the host config in your `~/.ssh/config`, such as:

```
Host github.com
  User c060604
  ProxyCommand nc -v -x 127.0.0.1:6152 %h %p
```

### Delete Host

```
$ ssh-config delete -h
Usage: delete [options]

delete ssh config

Options:
  -H, --host <host>  Which host to delete
  -h, --help         output usage information
```

### Remove All Host Configs

> ssh-config remove-all -h

### List All Host Configs

> ssh-config ls