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
            }
        }

        public async Task JoinMainRoom()
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();

            _roomService.AddUserToRoom("main", token);
            await Groups.AddToGroupAsync(connectionId, "main");

            await SendUpdatedRoomList();
        }
        public async Task UpdateProfile(string username, string avatarId)
        {
            string token = GetUserToken();
            var user = _userService.GetOrCreateUser(token);
            user.Name = username;
            user.AvatarId = avatarId;

            await SendUpdatedRoomList();
        }

        public async Task CreateRoom(string roomName, string user)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();

            await Console.Out.WriteLineAsync($"Creating room: {roomName}");
            if (_roomService.DoesRoomExists(roomName))
            {
                await Clients.Caller.SendAsync("ReceiveError", "Room already exists!");
                return;
            }
            _roomService.GetOrCreateRoom(roomName, token);
            await Clients.Caller.SendAsync("ReceiveSuccess", $"Room {roomName} created with token {token}!");

            await SendUpdatedRoomList();
        }
        public async Task JoinRoom(string roomName)
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();

            if (!_roomService.DoesRoomExists(roomName))
            {
                return; //Trying to enter nonexistent room
            }
            _roomService.AddUserToRoom(roomName, token);
            await Groups.AddToGroupAsync(connectionId, roomName);
            await Clients.OthersInGroup(roomName).SendAsync("UserConnected", _userService.GetUserInfo(token));

            await SendUpdatedRoomList();
        }
        public async Task LeaveRoom(string roomName)
        {
            var connectionId = Context.ConnectionId;
            string token = GetUserToken();

            await Clients.OthersInGroup(roomName).SendAsync("UserDisconnected", _userService.GetUserInfo(token));

            await Groups.RemoveFromGroupAsync(connectionId, roomName);
            _roomService.RemoveUserFromRoom(roomName, token);

            await SendUpdatedRoomList();
        }
        public async Task SendMessage(string roomName, string text)
        {
            string token = GetUserToken();
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

            await Clients.Group(roomName).SendAsync("ReceiveMessage", roomName, userInfo, text);
        }
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
        }


        public override async Task OnDisconnectedAsync(Exception? exception)
        {

            var connectionId = Context.ConnectionId;
            var token = GetUserToken();
            foreach (var room in _roomService.GetUserGroups(token))
            {
                await Clients.OthersInGroup(room).SendAsync("UserDisconnected", _userService.GetUserInfo(token));
            }

            _roomService.RemoveUserFromAllRooms(token);
            await base.OnDisconnectedAsync(exception);

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
