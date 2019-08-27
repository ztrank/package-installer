#!/usr/bin/env node
var argv = require('argv');
var fs = require('fs');
var Run = require('../dist/index.js');


argv.version('0.2.5-pre');

var args = argv.option([
    {
        name: 'bucket',
        short: 'b',
        type: 'string',
        description: 'Defines the bucket to check for packages. Defaults to "azimuth-packages"',
        example: "'azip --bucket=value' or 'azip -b value"
    },
    {
        name: 'account',
        short: 'a',
        type: 'string',
        description: 'Defines the google storage service account keyfile. Defaults to "C:\\service-accounts\\azimuth-package-manager.json"',
        example: "'azip --account=value' or 'azip -a value"
    },
    {
        name: 'temp',
        short: 't',
        type: 'string',
        description: 'Defines the temp directory to download packages into. Defaults to C:\\Temp\\azimuth-packages',
        example: "'azip --temp=value' or 'azip -t value"
    }
]).run();

Run(
    args.account,
    args.bucket,
    args.temp
).subscribe(() => {});