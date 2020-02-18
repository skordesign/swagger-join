var fs = require('fs');
var program = require('commander');
var request = require('request');
var cFile = undefined;
var output = 'output.json';
program.version('1.0.0')
    .arguments('<configFile>')
    .action((configFile) => {
        cFile = configFile;
    })
program.option('-o, --output <outputName>')

program.parse(process.argv);
if (typeof cFile == 'undefined') {
    console.error('Need config file');
    process.exit(1);
}
if (typeof program.output != undefined) {
    output = program.output
}

var json = fs.readFileSync(cFile);
var obj = JSON.parse(json);

var result = {
    swagger: obj.swagger,
    info: obj.info,
    paths: {},
    definitions: {},
    basePath: obj.basePath ? obj.basePath : "http://localhost"
}
var i = 0;
obj.apis.forEach(api => {
    request({ url: api.url, json: true }, (error, res, body) => {
        i++;
        if (!error && res.statusCode == 200) {
            for (var p in body.paths) {
                result.paths[p] = body.paths[p]
            }
            for (var p in body.definitions) {
                result.definitions[p] = body.definitions[p];
            }
            if (obj.apis.length == i) {
                callBack();
            }
        }
    })
});

function callBack() {
    fs.writeFileSync(output, JSON.stringify(result));
}
