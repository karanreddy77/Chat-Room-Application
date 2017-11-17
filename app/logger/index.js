'use strict';

const winston = require('winston');
const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			level: 'debug',
			json: true,
			handleException: true
		})
	],
	exitOnError: false
});

module.exports = logger;