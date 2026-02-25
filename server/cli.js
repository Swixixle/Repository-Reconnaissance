#!/usr/bin/env node
require("ts-node/register");
const { main } = require("./cli.ts");
main(process.argv);
