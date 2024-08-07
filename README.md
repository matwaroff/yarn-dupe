# yarn-dupe

## Description
This command will check a yarn.lock file for any conflicting duplicate packages. 

For example, if two dependencies require the same child dependency of different versions, they would be considered conflicting and both child versions would be included in the resulting build.

This can help identify those version mismatches, so you can update your packages accordingly.

## Usage

To install globally run: 
```bash
npm i -g yarn-dupe
```

To run without installing, run:
```bash
npx yarn-dupe <fileName> -p <prefix>
```

### Arguments
- \<fileName> - The path to the yarn.lock file you want to check

### Options

|Option|Default|Description|
|------|-------|-----------|
|-p \<prefix\>| @xds |The prefix to check the dependencies for|
