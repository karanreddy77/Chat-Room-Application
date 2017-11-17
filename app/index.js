'use strict';

const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

// Social authentication logic
require('./auth')();

// Creating an IO Server instance
let ioServer = app => {
	app.locals.chatrooms = [];
	const server = require('http').Server(app);
	const io = require('socket.io')(server);
	// Force socket.io to use only websockets as the transport medium
	io.set('transports', ['websocket']);
	// Publish client to send buffer to redis
	let pubClient = redis(config.redis.port, config.redis.host, {
		auth_pass: config.redis.password
	});
	// Subscribe client to receive buffer from redis
	// Make return_buffers = true to receive in original buffer state, not as string
	let subClient = redis(config.redis.port, config.redis.host, {
		return_buffers: true,
		auth_pass: config.redis.password
	});
	// Interface redis with socket.io
	io.adapter(adapter({
		pubClient,
		subClient
	}));
	io.use((socket, next) => {
		require('./session')(socket.request, {}, next);
	});
	require('./socket')(io, app);
	return server;
}

module.exports = {
	router: require('./routes')(),
	session: require('./session'),
	ioServer,
	logger: require('./logger')
}