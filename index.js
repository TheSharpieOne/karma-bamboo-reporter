var os = require('os')
    , path = require('path')
    , fs = require('fs')
    , filename = 'mocha.json'; // because the bamboo plugin looks here....


var bambooReporter = function (baseReporterDecorator) {
    baseReporterDecorator(this);

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
        title: test.suite.join(' ') + ' on ' + test.browser, fullTitle: test.suite.join(' ') + ' ' + test.description + ' on ' + test.browser, duration: test.time
    };
    if (!test.success) {
        o.error = test.log.join('\n');
    }
    return o;
}

bambooReporter.$inject = ['baseReporterDecorator'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:bamboo': ['type', bambooReporter]
};
