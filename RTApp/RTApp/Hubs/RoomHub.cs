using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System;
using System.IO;
using System.Collections;
using System.Linq;
using System.Text.Json;
using Microsoft.Extensions.Primitives;
using System.Security.Claims;

namespace RTApp.Hubs
{
    public class RoomHub : Hub
    {
        private readonly IUserService _userService;
        private readonly ILogger<RoomHub> _logger;
        private readonly IConfiguration _configuration;
        private readonly IRoomService _roomService;
        private readonly IMessageService _messageService;

        public RoomHub(IUserService userService, ILogger<RoomHub> logger, IConfiguration configuration, IRoomService roomService, IMessageService messageService) : base()
        {
            _userService = userService;
            _logger = logger;
            _configuration = configuration;
            _roomService = roomService;
            _messageService = messageService;
        }
        public override async Task OnConnectedAsync()
        {
            string userToken = GetUserToken();
            Context.Items["UserId"] = userToken;
            await base.OnConnectedAsync();
            await SendUpdatedRoomList();
        }

        public async Task JoinMainRoom()
        {
            string connectionId = Context.ConnectionId;
            string token = GetUserToken();

            _roomService.AddUserToRoom("main", token);
            await Groups.AddToGroupAsync(connectionId, "main");

            await SendUpdatedRoomList(token);
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

            var result = _messageService.ProcessMessage(roomName, text, token);
            if (result == null)
            {
                return;
            }
            if (result.IsOverlay)
            {
                await Clients.Group(roomName).SendAsync("ReceiveOverlay", result.OverlayPath);
            }
            if (result.IsMessage)
            {
                await Clients.Group(roomName).SendAsync("ReceiveMessage", roomName, result.User, text);
            }

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
        public async Task DeleteRoom(string roomName)
        {
            string token = GetUserToken();
            _roomService.DeleteRoom(roomName, token);
            await SendUpdatedRoomList();

        }
        private async Task SendUpdatedRoomList()
        {
            foreach (var t in _roomService.GetConnectedUserTokens())
            {
                var roomList = _roomService.GetAllRooms(t);
                await Clients.User(t).SendAsync("ReceiveRoomsList", roomList);
            }
        }
        private async Task SendUpdatedRoomList(string token)
        {
            var roomList = _roomService.GetAllRooms(token);
            await Clients.User(token).SendAsync("ReceiveRoomsList", roomList);
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
