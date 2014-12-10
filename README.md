karma-bamboo-reporter
=====================

A quick an dirty karma reporter that integrates with bamboo via https://marketplace.atlassian.com/plugins/com.atlassian.bamboo.plugins.bamboo-nodejs-plugin

Install
------------
`npm install karma-bamboo-reporter`

Usage
------------
```
...

reporters: ['bamboo'],

bambooReporter:{
    filename: 'util.mocha.json' //optional, defaults to "mocha.json"
},

...
```