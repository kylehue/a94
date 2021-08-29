module.exports = {
	commands: {
		lockRoom: {
			cmd: "/lock",
			description: "Make the room private. People won't be able to access the room without the admin's permission."
		},
		unlockRoom: {
			cmd: "/unlock",
			description: "Make the room public."
		},
		changeRoomName: {
			cmd: "/name",
			description: "Modify the room's name."
		},
		changeRoomCode: {
			cmd: "/code",
			description: "Modify the room's secret code."
		}
	}
}