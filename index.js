#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const shell = require("shelljs");
const SSH_PROXY_CONFIG_PATH = "./proxy_config";
const SSH_CONFIG_PATH = "~/.ssh/config";


program.version("0.1.0");

// set proxy
program
    .command("set-proxy <proxy>")
    .description("setup proxy")
    .action(function(proxy) {
        fs.writeFileSync(SSH_PROXY_CONFIG_PATH, proxy, {
            encoding: "utf8",
            flag: "w"
        });
    });

// add ssh config
program
    .command("add")
    .description("add ssh config")
    .option("-H, --host <host>", "Which host to request")
    .option("-u, --user <user>", "Which user to login")
    .option("-p, --proxy <proxy>", "Which proxy to use")
    .action(function(cmd) {
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
            }
        } else {
            proxy = cmd.proxy;
        }
        const config = `Host ${cmd.host}\n  User ${cmd.user}\n  ProxyCommand nc -v -x ${proxy} %h %p`;
        if (shell.exec(`echo '${config}' >> ${SSH_CONFIG_PATH}`).code !== 0) {
            shell.echo('add config error');
            shell.exit(1);
        }
    }).on("--help", function() {
        console.log("");
        console.log("Example:");
        console.log("");
        console.log("  $ ssh-config add -h github.com -u git");
        console.log("  $ ssh-config add -h github.com -u git -p 127.0.0.1:1086");
    });

program.parse(process.argv);