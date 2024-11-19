public interface IMessageService
{
    ProcessMessageResult? ProcessMessage(string roomName, string text, string token);
}
public class MessageService : IMessageService
{
    private readonly IUserService _userService;
    private readonly IRoomService _roomService;


    public MessageService(IUserService userService, IRoomService roomService)
    {
        _userService = userService;
        _roomService = roomService;
    }

    public ProcessMessageResult? ProcessMessage(string roomName, string text, string token)
    {
        var user = _userService.GetUserInfo(token);
        if (user == null)
        {
            return null;
        }

        if (text.StartsWith("/"))
        {
            if (_roomService.GetOrCreateRoom(roomName, token).AdminToken != token)
            {
                return null;
            }
            string[] arg = text.Split(' ');
            if (arg.Length == 2)
            {
                return new ProcessMessageResult() { IsOverlay = true, OverlayPath = arg[1] };
            }

            return null;
        }
        return new ProcessMessageResult() {IsMessage = true, User = user, Message = text };

    }
}

public class ProcessMessageResult
{
    public bool IsOverlay { get; set; } = false;
    public bool IsMessage { get; set; } = false;
    public string? OverlayPath { get; set; } = null;
    public UserInfoModel? User { get; set; }
    public string? Message { get; set; }
}