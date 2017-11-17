'use strict';
const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURI);
const logger = require('../logger');

Mongoose.connection.on('error', error => {
	logger.log('error', 'MongoDB connection error: ' + error);
});

const chatUser = new Mongoose.Schema({
	profileId: String,
	fullName: String,
	profilePic: String
});

let userModel = Mongoose.model('chatUser', chatUser);

module.exports = {
	Mongoose,
	userModel
}