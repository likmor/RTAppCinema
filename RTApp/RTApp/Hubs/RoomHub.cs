using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System;
using System.IO;
using System.Collections;
using System.Linq;
using System.Text.Json;
using Microsoft.Extensions.Primitives;
using System.Security.Claims;

//public class RoomMember
//{
//    public string Token { get; set; }
//    public bool IsAdmin { get; set; }
//    public bool Online { get; set; }
//}

namespace RTApp.Hubs
{
    public class RoomHub : Hub
    {
        //public static ConcurrentDictionary<string, HashSet<RoomMember>> RoomMembers { get; set; } = new();
        //public static ConcurrentDictionary<string, PlayerInfo> RoomPlayer { get; set; } = new();


        private readonly IUserService _userService;
        private readonly ILogger<RoomHub> _logger;
        private readonly IConfiguration _configuration;
        private readonly IRoomService _roomService;

        public RoomHub(IUserService userService, ILogger<RoomHub> logger, IConfiguration configuration, IRoomService roomService) : base()
        {
            _userService = userService;
            _logger = logger;
            _configuration = configuration;
            _roomService = roomService;
        }
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            string userToken = GetUserToken();
            {
                string connectionId = Context.ConnectionId;
                //if (!string.IsNullOrEmpty(connectionId))
                //{
                //    _userService.AddOrUpdateNickname(userToken, "");
                //    //_userService.UpdateConnectionId(userToken, connectionId);
                //}

            }
        }

        public async Task JoinMainRoom()
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            //_userService.AddOrUpdateNickname(token, user);
            //_userService.UpdateConnectionId(token, connectionId);


            _roomService.AddUserToRoom("main", token);
            await Groups.AddToGroupAsync(connectionId, "main");
            //await Clients.Caller.SendAsync("ReceiveRoomsList", _roomService.GetAllRooms());

            await SendUpdatedRoomList();
            //var room = RoomMembers.GetOrAdd("main", new HashSet<RoomMember>());
            //if (!room.Any(x => x.Token == token))
            //{
            //    room.Add(new RoomMember { Token = token, IsAdmin = false, Online = true });
            //}

            //var roomUsers = RoomMembers.Select(x => new
            //{
            //    roomName = x.Key,
            //    Users = x.Value.Select(x => new { avatar = _userService.GetAvatarId(x.Token), online = x.Online })
            //});
            //await Clients.Caller.SendAsync("ReceiveRoomsList", roomUsers);
            //Console.WriteLine($"Token {token} joined room main");
        }
        public async Task UpdateProfile(string username, string avatarId)
        {
            string token = GetUserToken();
            var user = _userService.GetOrCreateUser(token);
            user.Name = username;
            user.AvatarId = avatarId;
            //_userService.AddOrUpdateNickname(token, username);
            //_userService.AddOrUpdateAvatarId(token, avatarId);
            //var matchingRooms = RoomMembers
            //    .Where(i => i.Value.Any(j => j.Token == token))
            //    .Select(i => i.Key);

            //foreach (var room in matchingRooms)
            //{
            //    SendRoomInfo(room);
            //}

            //var roomUsers = RoomMembers.Select(x => new
            //{
            //    roomName = x.Key,
            //    Users = x.Value.Select(x => new { avatar = _userService.GetAvatarId(x.Token), online = x.Online })
            //});
            //var roomList = _roomService.GetAllRooms();
            //await Clients.Group("main").SendAsync("ReceiveRoomsList", roomList);
            await SendUpdatedRoomList();
        }

        public async Task CreateRoom(string roomName, string user)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            //_userService.AddOrUpdateNickname(token, user);
            //_userService.UpdateConnectionId(token, connectionId);

            await Console.Out.WriteLineAsync($"Creating room: {roomName}");
            if (_roomService.DoesRoomExists(roomName))
            {
                await Clients.Caller.SendAsync("ReceiveError", "Room already exists!");
                return;
            }
            _roomService.GetOrCreateRoom(roomName, token);
            //if (RoomMembers.ContainsKey(roomName))
            //{
            //    await Clients.Caller.SendAsync("ReceiveError", "Room already exists!");
            //    return;
            //}
            //await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            //var room = RoomMembers.GetOrAdd(roomName, new HashSet<RoomMember>());
            //if (!room.Any(x => x.Token == token))
            //{
            //    room.Add(new RoomMember { Token = token, IsAdmin = true, Online = true });
            //}
            await Clients.Caller.SendAsync("ReceiveSuccess", $"Room {roomName} created with token {token}!");


            //var roomUsers = RoomMembers.Select(x => new
            //{
            //    roomName = x.Key,
            //    Users = x.Value.Select(x => new { avatar = _userService.GetAvatarId(x.Token), online = x.Online })
            //});
            //await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
            await SendUpdatedRoomList();
        }
        public async Task JoinRoom(string roomName)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            //_userService.AddOrUpdateNickname(token, user);
            //_userService.UpdateConnectionId(token, connectionId);

            if (_roomService.DoesRoomExists(roomName))
            {
                _roomService.AddUserToRoom(roomName, token);
                await Groups.AddToGroupAsync(connectionId, roomName);
            }
            else
            {
                //Trying to enter nonexistent room
            }
            //var room = RoomMembers.GetOrAdd(roomName, new HashSet<RoomMember>());
            //if (!room.Any(x => x.Token == token))
            //{
            //    room.Add(new RoomMember { Token = token, IsAdmin = false, Online = true });
            //}
            //else if (room.Any(x => x.IsAdmin == true && x.Token == token))
            //{
            //    room.FirstOrDefault(x => x.IsAdmin).Online = true;
            //}
            //_userService.AddOrUpdateNickname(token, user);
            //SendRoomInfo(roomName);
            //Console.WriteLine($"Token {token} joined room {roomName}");

            //var roomUsers = RoomMembers.Select(x => new
            //{
            //    roomName = x.Key,
            //    Users = x.Value.Select(x => new { avatar = _userService.GetAvatarId(x.Token), online = x.Online })
            //});
            //await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
            //ReceiveFileList();
            await SendUpdatedRoomList();
        }
        public async Task LeaveRoom(string roomName)
        {
            var connectionId = Context.ConnectionId;
            string token = GetUserToken();

            await Groups.RemoveFromGroupAsync(connectionId, roomName);
            _roomService.RemoveUserFromRoom(roomName, token);
            //string token = _userService.GetTokenFromConnectionId(connectionId);
            //if (token == null)
            //{
            //    return;
            //}
            //var admin = RoomMembers[roomName].FirstOrDefault(x => x.Token == token && x.IsAdmin);
            //if (admin != null)
            //{
            //    admin.Online = false;
            //}
            //RoomMembers[roomName].RemoveWhere(x => x.Token == token && !x.IsAdmin);
            //await SendRoomInfo(roomName);

            //var roomUsers = RoomMembers.Select(x => new
            //{
            //    roomName = x.Key,
            //    Users = x.Value.Select(x => new { avatar = _userService.GetAvatarId(x.Token), online = x.Online })
            //});
            //await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
            await SendUpdatedRoomList();
        }
        //public async Task ReceiveFileList()
        //{
        //    var folderFiles = GetFilesFromFolders(_configuration["Files:Path"]);

        //    string json = JsonSerializer.Serialize(folderFiles, new JsonSerializerOptions { WriteIndented = true });

        //    Clients.Caller.SendAsync("ReceiveFileList", json);
        //}
        public async Task SendMessage(string roomName, string text)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            //_userService.AddOrUpdateNickname(token, user);
            //_userService.UpdateConnectionId(token, connectionId);

            //string nickname = _userService.GetNickname(token);
            //var senderInfo = RoomMembers.GetValueOrDefault(roomName)
            //    .FirstOrDefault(x => x.Token == token);
            var user = _roomService.TryGetUser(token);
            if (user == null)
            {
                return;
            }
            var userInfo = new
            {
                name = user.Name,
                image = user.AvatarId,
            };
            //SendRoomInfo(roomName);
            //await Console.Out.WriteLineAsync($"{token} send {text} in {roomName}");
            await Clients.Group(roomName).SendAsync("ReceiveMessage", roomName, userInfo, text);
            //await SendUpdatedRoomList();
        }
        //public async Task SendRoomInfo(string roomName)
        //{
        //    var users = RoomMembers.GetValueOrDefault(roomName).
        //        Select(item => new
        //        {
        //            name = _userService.GetNickname(item.Token),
        //            image = _userService.GetAvatarId(item.Token),
        //            owner = item.IsAdmin,
        //            online = item.Online,
        //        });
        //    await Clients.Group(roomName).SendAsync("ReceiveRoomInfo", roomName, users);
        //}
        public async Task SendPlayerInfo(string roomName, bool isPaused, float time, string fileName)
        {
            string token = GetUserToken();
            if (!_roomService.DoesRoomExists(roomName))
            {
                return;
            }
            var isStateUpdated = _roomService.TryUpdatePlayer(roomName, token,
                new PlayerStateModel() { Paused = isPaused, CurrentTime = time, FileName = fileName });

            if (isStateUpdated)
            {
                await ReceivePlayerInfo(roomName);
            }
            //if (RoomMembers.GetValueOrDefault(roomName).Any(item => item.IsAdmin && token == item.Token))
            //{
            //    RoomPlayer.AddOrUpdate(
            //                roomName,
            //                new PlayerInfo { IsPaused = isPaused, currentTime = time, Name = name }, // Value to add if the key does not exist
            //                (key, existingPlayerInfo) =>
            //                {
            //                    // Update the existing player info
            //                    existingPlayerInfo.IsPaused = isPaused;
            //                    existingPlayerInfo.currentTime = time;
            //                    existingPlayerInfo.Name = name;
            //                    return existingPlayerInfo;
            //                }
            //            );
            //    ReceivePlayerInfo(roomName);
            //}
            //await Clients.Group(roomName).SendAsync("ReceivePlayerInfo", roomName, users);
        }
        public async Task ReceivePlayerInfo(string roomName)
        {
            string token = GetUserToken();
            var state = _roomService.GetPlayerState(roomName);
            if (state == null)
            {
                return;
            }
            await Clients.OthersInGroup(roomName).SendAsync("ReceivePlayerInfo", roomName, state);
            //var playerInfo = RoomPlayer.GetValueOrDefault(roomName);
            //if (playerInfo != null)
            //{
            //    Clients.OthersInGroup(roomName).SendAsync("ReceivePlayerInfo", roomName, new { playerInfo.IsPaused, playerInfo.currentTime, playerInfo.Name });

            //}
        }


        public override async Task OnDisconnectedAsync(Exception? exception)
        {

            var connectionId = Context.ConnectionId;
            var token = GetUserToken();
            _roomService.RemoveUserFromAllRooms(token);

            //string token = _userService.GetTokenFromConnectionId(connectionId);
            //if (token == null)
            //{
                await base.OnDisconnectedAsync(exception);
            //    return;
            //}
            //Console.WriteLine($"Client disconnected: {GetUserToken()}");
            //foreach (var roomEntry in RoomMembers)
            //{
            //    var roomName = roomEntry.Key;
            //    var members = roomEntry.Value;

            //    var memberToRemove = members.FirstOrDefault(m => m.Token == token && !m.IsAdmin);
            //    var adminToRemove = members.FirstOrDefault(m => m.Token == token && m.IsAdmin);



            //    if (memberToRemove != null)
            //    {
            //        members.Remove(memberToRemove);
            //        SendRoomInfo(roomName);

            //    }
            //    if (adminToRemove != null)
            //    {
            //        adminToRemove.Online = false;
            //        SendRoomInfo(roomName);

            //    }
            //}

            //var roomUsers = RoomMembers.Select(x => new
            //{
            //    roomName = x.Key,
            //    Users = x.Value.Select(x => new { avatar = _userService.GetAvatarId(x.Token), online = x.Online })
            //});
            //await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
            await SendUpdatedRoomList();

        }
        private async Task SendUpdatedRoomList()
        {
            var roomList = _roomService.GetAllRooms();
            await Clients.Group("main").SendAsync("ReceiveRoomsList", roomList);
        }
        private string GetUserToken()
        {
            var query = Context.GetHttpContext()?.Request.Query["access_token"];
            return query.ToString() ?? "";
        }
        static Dictionary<string, List<string>> GetFilesFromFolders(string directoryPath)
        {
            Dictionary<string, List<string>> folderFiles = new Dictionary<string, List<string>>();

            try
            {
                // Get all directories (folders) in the given directory
                string[] directories = Directory.GetDirectories(directoryPath);

                foreach (var directory in directories)
                {
                    // Get all files in the current directory
                    string[] directoryFiles = Directory.GetFiles(directory);

                    // Add directory and its files to the dictionary
                    folderFiles[directory] = new List<string>(directoryFiles);

                    // Recursively get files from subdirectories
                    var subFolderFiles = GetFilesFromFolders(directory);

                    // Merge subfolder files into the main dictionary
                    foreach (var kvp in subFolderFiles)
                    {
                        folderFiles[kvp.Key] = kvp.Value;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
            }

            return folderFiles;
        }
    }
}
