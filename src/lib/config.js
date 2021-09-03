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
			description: "Modify the room's secret code. Only the room owner can use this command."
		},
		promoteUser: {
			cmd: "/promote",
			description: "Promote mentioned users to Admin."
		},
		demoteUser: {
			cmd: "/demote",
			description: "Demote an Admin."
		},
		kickUser: {
			cmd: "/kick",
			description: "Kick mentioned users."
		}
	},
	maxCharacters: 2000,
	maxFileSize: 1024 * 1024 * 100, //100 MB
	maxMessages: 20
}