#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const shell = require("shelljs");
const SSH_PROXY_CONFIG_PATH = "./proxy_config";
const SSH_CONFIG_PATH = "~/.ssh/config";
const HOST_FLAG = "Host";


program.version("0.1.0");

// set proxy
// TODO: reset all existent configs' proxy
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
        // To avoid the same host config
        removeHostConfig(cmd.host);

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
        if (!isExist(SSH_CONFIG_PATH)) {
            console.log(`error: the host ${cmd.host} not found in the config`);
            return;
        }

        const result = removeHostConfig(cmd.host);
        if (!result) {
            console.log(`error: the host ${cmd.host} not found in the config`);
        } else {
            console.log(`delete ${cmd.host} config done.`);
        }
    });

// list all configs
program
    .command("ls")
    .description("list all configs")
    .action(function() {
        if (isExist(SSH_CONFIG_PATH)) {
            const config = shell.cat(SSH_CONFIG_PATH);
            console.log(config.toString());
        }
    });

// remove all configs
program
    .command("remove-all")
    .description("remove all configs")
    .action(function() {
        if (isExist(SSH_CONFIG_PATH)) {
            shell.rm("-rf", SSH_CONFIG_PATH)
        }
        console.log("remove all configs done.");
    })

program.parse(process.argv);

function isExist(filePath) {
    if (shell.exec(`ls ${SSH_CONFIG_PATH}`, {silent: true}).code !== 0) {
        return false;
    }
    return true;
}

function removeHostConfig(host) {
    const config = shell.cat(SSH_CONFIG_PATH);
    const configs = config.toString().split(HOST_FLAG);
    const index = configs.findIndex(item => item.trim().startsWith(host));
    if (index === -1) {
        return false;
    } else {
        // delete the host config
        configs.splice(index, 1);
        shell.exec(`echo '${configs.join(HOST_FLAG)}' > ${SSH_CONFIG_PATH}`);
        return true;
    }
}