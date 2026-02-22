#!/usr/bin/env node

import { Command } from "commander";
import { createCommand } from "./commands/create.js";
import { fetchCommand } from "./commands/fetch.js";
import { updateCommand } from "./commands/update.js";
import { watchCommand } from "./commands/watch.js";

const program = new Command();

program
    .name("collab")
    .description("CLI tool for NIP-C1 Collaborative Events")
    .version("1.0.0");

program.addCommand(createCommand);
program.addCommand(fetchCommand);
program.addCommand(updateCommand);
program.addCommand(watchCommand);

program.parse();
