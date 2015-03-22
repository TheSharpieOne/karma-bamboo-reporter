var fs = require('fs')
    , filename = 'mocha.json';

var fE;

var bambooReporter = function (baseReporterDecorator, config, formatError) {
    fE = formatError;
    baseReporterDecorator(this);

    filename = config && config.filename || filename;

    var results = {
        time: 0, tests: [], failures: [], passes: [], skips: []
    };

    this.onRunStart = function () {
        this._browsers = [];
        if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);
        }
    };

    this.onSpecComplete = function (browser, result) {
        results.time += result.time;
        result.browser = browser.name;
        results.tests.push(result);
        if (result.skipped) results.skips.push(result);
        else if (result.success) results.passes.push(result);
        else results.failures.push(result);
    };

    this.onRunComplete = function (browser, result) {
        var obj = {
            stats: {tests: (result.success + result.failed), passes: result.success, failures: result.failed, duration: results.time }, failures: results.failures.map(clean), passes: results.passes.map(clean), skipped: results.skips.map(clean)
        };

        fs.writeFileSync(filename, JSON.stringify(obj, null, 2), 'utf-8');
        results = {
            time: 0, tests: [], failures: [], passes: [], skips: []
        };
    };
};

function clean(test) {
    var o = {
        title       : test.suite.concat(test.description).join(' '),
        fullTitle   : test.suite[0],
        duration    : test.time
    };
    if (!test.success) {
        o.error = '';
        test.log.forEach(function(log) {
          // translate sourcemap
          log = fE(log);
          o.error += log.split('\n').reduce(function(memo, line, i) {
            // keep first line
            line = line.split('<-');
            if (line[1]) memo += '\n\tat' + line[1];
            return memo;
          })
        });
    }
    return o;
}

bambooReporter.$inject = ['baseReporterDecorator', 'config.bambooReporter', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:bamboo': ['type', bambooReporter]
};
