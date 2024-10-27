using System.Collections.Concurrent;

public interface IRoomService
{
    public void AddUserToRoom(string roomName, string token);
    public void RemoveUserFromRoom(string roomName, string token);
    public void RemoveUserFromAllRooms(string token);
    public User? TryGetUser(string token);
    public Room? GetOrCreateRoom(string roomName, string adminToken);
    public IEnumerable<RoomInfoModel> GetAllRooms();
    public bool DoesRoomExists(string roomName);
    public bool TryUpdatePlayer(string roomName, string token, PlayerStateModel state);
    public PlayerStateModel? GetPlayerState(string roomName);

}
public class RoomService : IRoomService
{
    private readonly IUserService _userService;
    public static ConcurrentBag<Room> _rooms { get; set; } = new();
    public RoomService(IUserService userService)
    {
        _userService = userService;
    }
    public void AddUserToRoom(string roomName, string token)
    {
        User _user = _userService.GetOrCreateUser(token);

        var room = GetOrCreateRoom(roomName, token);
        room.UserTokens.Add(_user.Token);
    }
    public void RemoveUserFromRoom(string roomName, string token)
    {
        var room = GetOrCreateRoom(roomName, token);
        room.UserTokens.Remove(token);
    }
    public void RemoveUserFromAllRooms(string token)
    {
        foreach (var room in _rooms)
        {
            room.UserTokens.Remove(token);
        }
    }
    public Room GetOrCreateRoom(string roomName, string adminToken)
    {
        var existingRoom = _rooms.FirstOrDefault(r => r.Name == roomName);
        if (existingRoom != null)
        {
            return existingRoom;
        }

        var newRoom = new Room
        {
            Name = roomName,
            AdminToken = adminToken,
            UserTokens = new List<string>(),
            PlayerInfo = new PlayerInfo()
        };
        _rooms.Add(newRoom);
        return newRoom;
    }
    public User? TryGetUser(string token)
    {
        return _userService.GetOrCreateUser(token);
    }
    public IEnumerable<RoomInfoModel> GetAllRooms()
    {
        return _rooms.Where(room => room.Name != "main").Select(room =>
        {
            var admin = _userService.GetUserInfo(room.AdminToken);
            if (admin != null)
            {
                admin.Online = room.UserTokens.Any(u => u == room.AdminToken);
                admin.Owner = true;
            }
            var roomInfo = new RoomInfoModel()
            {
                Name = room.Name,
                Admin = admin,
                Users = room.UserTokens
                    .Where(token => token != room.AdminToken)
                    .Select(token =>
                {
                    var user = _userService.GetUserInfo(token);
                    if (user != null)
                    {
                        user.Online = true;
                    }
                    return user;
                })
            };
            return roomInfo;
        });
    }
    public bool DoesRoomExists(string roomName)
    {
        return _rooms.Any(x => x.Name == roomName);
    }
    public bool TryUpdatePlayer(string roomName, string token, PlayerStateModel state)
    {
        var existingRoom = _rooms.FirstOrDefault(r => r.Name == roomName);

        if (existingRoom == null || existingRoom.AdminToken != token)
        {
            return false;
        }
        existingRoom.PlayerInfo.Paused = state.Paused;
        existingRoom.PlayerInfo.CurrentTime = state.CurrentTime;
        existingRoom.PlayerInfo.FileName = state.FileName;

        return true;
    }
    public PlayerStateModel? GetPlayerState(string roomName)
    {
        var existingRoom = _rooms.FirstOrDefault(r => r.Name == roomName);
        if (existingRoom == null)
        {
            return null;
        }
        return new PlayerStateModel()
        {
            Paused = existingRoom.PlayerInfo.Paused,
            CurrentTime = existingRoom.PlayerInfo.CurrentTime,
            FileName = existingRoom.PlayerInfo.FileName,
        };

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