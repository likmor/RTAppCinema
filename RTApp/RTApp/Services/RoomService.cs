using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

public interface IRoomService
{
	void AddUserToRoom(string roomName, string token);
	void RemoveUserFromRoom(string roomName, string token);
	void RemoveUserFromAllRooms(string token);
	bool IsRoomDeletableByUser(string roomName, string token);
	bool DeleteRoom(string roomName, string token);
	User? TryGetUser(string token);
	Room GetOrCreateRoom(string roomName, string adminToken);
	IEnumerable<RoomInfoModel> GetAllRooms(string token);
	bool DoesRoomExists(string roomName);
	bool TryUpdatePlayer(string roomName, string token, PlayerStateModel state);
	PlayerStateModel? GetPlayerState(string roomName);
	IEnumerable<string> GetUserGroups(string token);
	IEnumerable<string> GetConnectedUserTokens();
}

public class RoomService : IRoomService
{
	private readonly IUserService _userService;
	private readonly ConcurrentDictionary<string, Room> _rooms = new();

	public RoomService(IUserService userService)
	{
		_userService = userService;
	}

	public void AddUserToRoom(string roomName, string token)
	{
		User user = _userService.GetOrCreateUser(token);
		var room = GetOrCreateRoom(roomName, token);
		room.UserTokens.Add(user.Token);
	}

	public void RemoveUserFromRoom(string roomName, string token)
	{
		if (_rooms.TryGetValue(roomName, out var room))
		{
			room.UserTokens.Remove(token);
		}
	}

	public void RemoveUserFromAllRooms(string token)
	{
		foreach (var room in _rooms.Values)
		{
			room.UserTokens.Remove(token);
		}
	}

	public bool IsRoomDeletableByUser(string roomName, string token)
	{
		return _rooms.TryGetValue(roomName, out var room) && room.AdminToken == token;
	}

	public Room GetOrCreateRoom(string roomName, string adminToken)
	{
		return _rooms.GetOrAdd(roomName, new Room
		{
			Name = roomName,
			AdminToken = adminToken,
			UserTokens = new List<string>(),
			PlayerInfo = new PlayerInfo()
		});
	}

	public User? TryGetUser(string token)
	{
		return _userService.GetOrCreateUser(token);
	}

	public IEnumerable<string> GetUserGroups(string token)
	{
		return _rooms.Values
			.Where(room => room.Name != "main" && room.UserTokens.Contains(token))
			.Select(room => room.Name);
	}

	public IEnumerable<RoomInfoModel> GetAllRooms(string token)
	{
		return _rooms.Values
			.Where(room => room.Name != "main")
			.Select(room =>
			{
				var admin = _userService.GetUserInfo(room.AdminToken);
				if (admin != null)
				{
					admin.Online = room.UserTokens.Any(u => u == room.AdminToken);
					admin.Owner = true;
				}
				return new RoomInfoModel
				{
					Name = room.Name,
					Admin = admin,
					Users = room.UserTokens
						.Where(userToken => userToken != room.AdminToken)
						.Select(userToken =>
						{
							var user = _userService.GetUserInfo(userToken);
							if (user != null)
							{
								user.Online = true;
							}
							return user;
						}),
					Deletable = IsRoomDeletableByUser(room.Name, token)
				};
			});
	}

	public bool DoesRoomExists(string roomName)
	{
		return _rooms.ContainsKey(roomName);
	}

	public bool TryUpdatePlayer(string roomName, string token, PlayerStateModel state)
	{
		if (_rooms.TryGetValue(roomName, out var existingRoom) && existingRoom.AdminToken == token)
		{
			existingRoom.PlayerInfo.Paused = state.Paused;
			existingRoom.PlayerInfo.CurrentTime = state.CurrentTime;
			existingRoom.PlayerInfo.FileName = state.FileName;
			return true;
		}
		return false;
	}

	public PlayerStateModel? GetPlayerState(string roomName)
	{
		if (_rooms.TryGetValue(roomName, out var existingRoom))
		{
			return new PlayerStateModel
			{
				Paused = existingRoom.PlayerInfo.Paused,
				CurrentTime = existingRoom.PlayerInfo.CurrentTime,
				FileName = existingRoom.PlayerInfo.FileName
			};
		}
		return null;
	}

	public bool DeleteRoom(string roomName, string token)
	{
		if (!IsRoomDeletableByUser(roomName, token))
			return false;

		return _rooms.TryRemove(roomName, out _);
	}

	public IEnumerable<string> GetConnectedUserTokens()
	{
		var users = _rooms.Values.SingleOrDefault(x => x.Name == "main")?.UserTokens;
		if (users == null)
			return [];
		return users;
	}
}

public class Room
{
	required public string Name { get; set; }
	required public string AdminToken { get; set; } // Even if disconnected we store it
	public List<string> UserTokens { get; set; } = []; // Currently connected to room users
	required public PlayerInfo PlayerInfo { get; set; }
}
public class User
{
	required public string Token { get; set; }
	public string? Name { get; set; }
	public string? AvatarId { get; set; }

}
public class PlayerInfo
{
	public bool? Paused { get; set; }
	public float? CurrentTime { get; set; }
	public string? FileName { get; set; }

}