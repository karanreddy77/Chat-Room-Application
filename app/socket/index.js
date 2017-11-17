'use strict';
const utils = require('../utils');

module.exports = (io, app) => {
	let allrooms = app.locals.chatrooms;

	io.of('/roomslist').on('connection', socket => {
		socket.on('getChatrooms', () => {
			socket.emit('chatRoomsList', JSON.stringify(allrooms));
		});

		socket.on('createNewRoom', newRoomInput => {
			// checking to see if room with same title exists or not
			// if not, create one and broadcast it to everyone
			if(!utils.findRoomByName(allrooms, newRoomInput)) {
				//Create new room
				allrooms.push({
					room: newRoomInput,
					roomID: utils.randomHex(),
					users: []
				});

				//Emit an updated list to the creator
				socket.emit('chatRoomsList', JSON.stringify(allrooms));
				// Emit an updated list to everyone connected to the rooms page
				socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
			}
		});
	});

	io.of('/chatter').on('connection', socket => {
		socket.on('join', data => {
			let usersList = utils.addUserToRoom(allrooms, data, socket);
			//console.log(usersList);
			// Update the list of active users as shown on the chatroom page
			socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users));
			socket.emit('updateUsersList', JSON.stringify(usersList.users));
		});

		socket.on('disconnect', () => {
			// Find the room , to which the socket is connected to and purge the user
			let room = utils.removeUserFromRoom(allrooms, socket);
			socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users));
		});

		socket.on('newMessage', data => {
			socket.broadcast.to(data.roomID).emit('inMessage', JSON.stringify(data));
		});
	});
}