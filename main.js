import { Command } from "commander";
import { extractDupes } from "./check-dupe.js";

const program = new Command();
program
  .argument("<file>", "yarn file to process")
  .option("-p --prefix <prefix>", "prefix to filter packages", "@xds")
  .action((file, { prefix }) => {
    extractDupes(file, prefix);
  });

program.parse(process.argv);
