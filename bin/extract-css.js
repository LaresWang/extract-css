#!/usr/bin/env node

const { resolve } = require('path');
const command = require('commander');
const commands = require(resolve(__dirname, '../dist/index.js'));

// process.env.NODE_PATH = resolve(__dirname, '../node_modules/')

command
    .command("start")
    .alias("s")
    .description('start execute extract common css to specified file')
    .action(commands);
command.parse(process.argv);

if (!command.args.length) {
    command.help();
};