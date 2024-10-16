using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System;
using System.IO;
using System.Collections;
using System.Linq;
using System.Text.Json;

public class RoomMember
{
    public string Token { get; set; }
    public bool IsAdmin { get; set; }
    public bool Online { get; set; }
}
public class PlayerInfo
{
    public bool IsPaused { get; set; }
    public double currentTime { get; set; }
    public string Name { get; set; }
}

namespace RTApp.Hubs
{
    public class RoomHub : Hub
    {
        public static ConcurrentDictionary<string, HashSet<RoomMember>> RoomMembers { get; set; } = new();
        public static ConcurrentDictionary<string, string> ConnectionUserNames { get; set; } = new();
        public static ConcurrentDictionary<string, PlayerInfo> RoomPlayer { get; set; } = new();


        private readonly IUserService _userService;
        private readonly ILogger<RoomHub> _logger;
        private readonly IConfiguration _configuration;

        public RoomHub(IUserService userService, ILogger<RoomHub> logger, IConfiguration configuration) : base()
        {
            _userService = userService;
            _logger = logger;
            _configuration = configuration;
        }
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();


            string userToken = GetUserToken();

            {
                string connectionId = Context.ConnectionId;
                if (!string.IsNullOrEmpty(connectionId))
                {
                    _userService.AddOrUpdateNickname(userToken, "");
                    _userService.UpdateConnectionId(userToken, connectionId);
                }

            }
        }

        public async Task JoinMainRoom(string user)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            _userService.AddOrUpdateNickname(token, user);
            _userService.UpdateConnectionId(token, connectionId);


            await Groups.AddToGroupAsync(connectionId, "main");
            var room = RoomMembers.GetOrAdd("main", new HashSet<RoomMember>());
            if (!room.Any(x => x.Token == token))
            {
                room.Add(new RoomMember { Token = token, IsAdmin = false });
            }

            var roomUsers = RoomMembers.Select(x => new
            {
                roomName = x.Key,
                roomMembers = x.Value.Select(x => _userService.GetAvatarId(x.Token))
            });
            await Clients.Caller.SendAsync("ReceiveRoomsList", roomUsers);
            Console.WriteLine($"Token {token} joined room main");

        }
        public async Task CreateRoom(string roomName, string user)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            _userService.AddOrUpdateNickname(token, user);
            _userService.UpdateConnectionId(token, connectionId);


            await Console.Out.WriteLineAsync($"Creating room: {roomName}");
            if (RoomMembers.ContainsKey(roomName))
            {
                await Clients.Caller.SendAsync("ReceiveError", "Room already exists!");
                return;
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            var room = RoomMembers.GetOrAdd(roomName, new HashSet<RoomMember>());
            if (!room.Any(x => x.Token == token))
            {
                room.Add(new RoomMember { Token = token, IsAdmin = true });
            }
            await Clients.Caller.SendAsync("ReceiveSuccess", $"Room {roomName} created with token {token}!");


            var roomUsers = RoomMembers.Select(x => new
            {
                roomName = x.Key,
                roomMembers = x.Value.Select(x => _userService.GetAvatarId(x.Token))
            });
            await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
        }
        public async Task JoinRoom(string user, string roomName)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            _userService.AddOrUpdateNickname(token, user);
            _userService.UpdateConnectionId(token, connectionId);


            await Groups.AddToGroupAsync(connectionId, roomName);
            var room = RoomMembers.GetOrAdd(roomName, new HashSet<RoomMember>());
            if (!room.Any(x => x.Token == token))
            {
                room.Add(new RoomMember { Token = token, IsAdmin = false });
            }
            else if (room.Any(x => x.IsAdmin == true))
            {
                room.FirstOrDefault(x => x.IsAdmin).Online = true;
            }
            //ConnectionUserNames.AddOrUpdate(connectionId, user, (key, oldValue) => user);
            //
            _userService.AddOrUpdateNickname(token, user);
            //
            SendRoomInfo(roomName);
            Console.WriteLine($"Token {token} joined room {roomName}");

            var roomUsers = RoomMembers.Select(x => new
            {
                roomName = x.Key,
                roomMembers = x.Value.Select(x => _userService.GetAvatarId(x.Token))
            });
            await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
            //ReceiveFileList();
        }
        public async Task LeaveRoom(string roomName)
        {
            var connectionId = Context.ConnectionId;
            await Groups.RemoveFromGroupAsync(connectionId, roomName);

            string token = _userService.GetTokenFromConnectionId(connectionId);
            if (token == null)
            {
                return;
            }
            RoomMembers[roomName].FirstOrDefault(x => x.Token == token && x.IsAdmin).Online = false;
            RoomMembers[roomName].RemoveWhere(x => x.Token == token && !x.IsAdmin);
            await SendRoomInfo(roomName);

            var roomUsers = RoomMembers.Select(x => new
            {
                roomName = x.Key,
                roomMembers = x.Value.Select(x => _userService.GetAvatarId(x.Token))
            });
            await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
        }
        //public async Task ReceiveFileList()
        //{
        //    var folderFiles = GetFilesFromFolders(_configuration["Files:Path"]);

        //    string json = JsonSerializer.Serialize(folderFiles, new JsonSerializerOptions { WriteIndented = true });

        //    Clients.Caller.SendAsync("ReceiveFileList", json);
        //}
        public async Task SendMessage(string user, string roomName, string text)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();
            _userService.AddOrUpdateNickname(token, user);
            _userService.UpdateConnectionId(token, connectionId);

            //ConnectionUserNames.AddOrUpdate(connectionId, user, (key, oldValue) => user);
            //
            //_userService.AddOrUpdateNickname(token, user);
            string nickname = _userService.GetNickname(token);
            //
            var senderInfo = RoomMembers.GetValueOrDefault(roomName)
                .FirstOrDefault(x => x.Token == token);

            var userInfo = new
            {
                name = _userService.GetNickname(senderInfo.Token),
                image = _userService.GetAvatarId(senderInfo.Token),
                owner = senderInfo.IsAdmin
            };
            SendRoomInfo(roomName);
            await Console.Out.WriteLineAsync($"{token} send {text} in {roomName}");
            await Clients.Group(roomName).SendAsync("ReceiveMessage", roomName, userInfo, text);
        }
        public async Task SendRoomInfo(string roomName)
        {
            var users = RoomMembers.GetValueOrDefault(roomName).
                Select(item => new
                {
                    name = _userService.GetNickname(item.Token),
                    image = _userService.GetAvatarId(item.Token),
                    owner = item.IsAdmin,
                    online = item.Online,
                });
            await Clients.Group(roomName).SendAsync("ReceiveRoomInfo", roomName, users);
        }
        public async Task SendPlayerInfo(string roomName, bool isPaused, float time, string name)
        {
            string token = GetUserToken();
            if (RoomMembers.GetValueOrDefault(roomName).Any(item => item.IsAdmin && token == item.Token))
            {
                RoomPlayer.AddOrUpdate(
                            roomName,
                            new PlayerInfo { IsPaused = isPaused, currentTime = time, Name = name }, // Value to add if the key does not exist
                            (key, existingPlayerInfo) =>
                            {
                                // Update the existing player info
                                existingPlayerInfo.IsPaused = isPaused;
                                existingPlayerInfo.currentTime = time;
                                existingPlayerInfo.Name = name;
                                return existingPlayerInfo;
                            }
                        );
                ReceivePlayerInfo(roomName);
            }
            //await Clients.Group(roomName).SendAsync("ReceivePlayerInfo", roomName, users);
        }
        public async Task ReceivePlayerInfo(string roomName)
        {
            string token = GetUserToken();
            var playerInfo = RoomPlayer.GetValueOrDefault(roomName);
            if (playerInfo != null)
            {
                Clients.OthersInGroup(roomName).SendAsync("ReceivePlayerInfo", roomName, new { playerInfo.IsPaused, playerInfo.currentTime, playerInfo.Name });

            }
        }
        public async Task UpdateProfile(string username, string avatarId)
        {
            string token = GetUserToken();
            _userService.AddOrUpdateNickname(token, username);
            _userService.AddOrUpdateAvatarId(token, avatarId);
            var matchingRooms = RoomMembers
                .Where(i => i.Value.Any(j => j.Token == token))
                .Select(i => i.Key);

            foreach (var room in matchingRooms)
            {
                SendRoomInfo(room);
            }

            var roomUsers = RoomMembers.Select(x => new
            {
                roomName = x.Key,
                roomMembers = x.Value.Select(x => _userService.GetAvatarId(x.Token))
            });
            await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;
            await Console.Out.WriteLineAsync(connectionId);

            string token = _userService.GetTokenFromConnectionId(connectionId);
            if (token == null)
            {
                await base.OnDisconnectedAsync(exception);
                return;
            }
            Console.WriteLine($"Client disconnected: {token}");
            foreach (var roomEntry in RoomMembers)
            {
                var roomName = roomEntry.Key;
                var members = roomEntry.Value;

                var memberToRemove = members.FirstOrDefault(m => m.Token == token && !m.IsAdmin);
                var adminToRemove = members.FirstOrDefault(m => m.Token == token && m.IsAdmin);



                if (memberToRemove != null)
                {
                    members.Remove(memberToRemove);
                    SendRoomInfo(roomName);

                }
                if (adminToRemove != null)
                {
                    adminToRemove.Online = false;
                    SendRoomInfo(roomName);

                }
            }

            var roomUsers = RoomMembers.Select(x => new
            {
                roomName = x.Key,
                roomMembers = x.Value.Select(x => _userService.GetAvatarId(x.Token))
            });
            await Clients.Group("main").SendAsync("ReceiveRoomsList", roomUsers);
            //foreach (var connection in ConnectionUserNames)
            //{
            //    if (connection.Key == connectionId)
            //    {
            //        ConnectionUserNames.Remove(connectionId, out _);
            //    }
            //}

        }
        public string GetUserToken()
        {
            var query = Context.GetHttpContext().Request.Query["access_token"];
            return query.ToString();
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
