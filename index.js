#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const shell = require("shelljs");
const SSH_PROXY_CONFIG_PATH = "./proxy_config";
const SSH_CONFIG_PATH = "~/.ssh/config";
const HOST_FLAG = "Host";


program.version("0.1.0");

// set proxy
program
    .command("set-proxy <proxy>")
    .description("setup proxy")
    .action(function(proxy) {
        fs.writeFileSync(SSH_PROXY_CONFIG_PATH, proxy, {
            encoding: "utf8",
            flag: "w"
        })
        console.log(`set proxy ${proxy} done.`);
    });

// add ssh config
program
    .command("add")
    .description("add ssh config")
    .option("-H, --host <host>", "Which host to request")
    .option("-u, --user <user>", "Which user to login")
    .option("-p, --proxy <proxy>", "Which proxy to use")
    .action(function(cmd) {
        // TODO: to avoid the same host config
        let proxy;
        if (!cmd.host) {
            console.log("option '-H, --host <host>' argument missing");
            return;
        }
        if (!cmd.user) {
            console.log("option '-u, --user <user>' argument missing");
            return;
        }
        if (!cmd.proxy) {
            try {
                proxy = fs.readFileSync(SSH_PROXY_CONFIG_PATH);
            } catch (error) {
                console.log(error);
                console.log("error: lack of proxy. Use 'set-proxy <proxy>' to setup default proxy, or use 'add -H <host> -u <user> -p <proxy>'");
                return;
            }
        } else {
            proxy = cmd.proxy;
        }
        const config = `Host ${cmd.host}\n  User ${cmd.user}\n  ProxyCommand nc -v -x ${proxy} %h %p`;
        if (shell.exec(`echo '${config}' >> ${SSH_CONFIG_PATH}`).code !== 0) {
            shell.echo('add config error');
            shell.exit(1);
        }
        console.log(`add ${cmd.host} config done.`);
    }).on("--help", function() {
        console.log("");
        console.log("Example:");
        console.log("");
        console.log("  $ ssh-config add -h github.com -u git");
        console.log("  $ ssh-config add -h github.com -u git -p 127.0.0.1:1086");
    });

// delete ssh config
program
    .command("delete")
    .description("delete ssh config")
    .option("-H, --host <host>", "Which host to delete")
    .action(function(cmd) {
        // TODO: throw error when the file does not exist.
        const config = shell.cat(SSH_CONFIG_PATH);
        const configs = config.toString().split(HOST_FLAG);
        const index = configs.findIndex(item => item.trim().startsWith(cmd.host));
        if (index === -1) {
            console.log(`error: the host ${cmd.host} not found in the config`);
        } else {
            // delete the host config
            configs.splice(index, 1);
            shell.exec(`echo '${configs.join(HOST_FLAG)}' > ${SSH_CONFIG_PATH}`);
            console.log(`delete ${cmd.host} config done.`);
        }
    });

program.parse(process.argv);