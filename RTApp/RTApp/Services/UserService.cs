using System.Collections.Concurrent;
using System.Linq;

public interface IUserService
{
    string GetNickname(string token);
    string GetAvatarId(string token);

    void AddOrUpdateNickname(string token, string nickname);
    void AddOrUpdateAvatarId(string token, string avatarId);

    void UpdateConnectionId(string token, string connectionId);
    string? GetTokenFromConnectionId(string connectionId);
}

public class UserService : IUserService
{
    private static readonly ConcurrentDictionary<string, ApplicationUser> _users = new();

    public string GetNickname(string token)
    {
        return _users.TryGetValue(token, out var user) ? user.Nickname : string.Empty;
    }
    public string GetAvatarId(string token)
    {
        return _users.TryGetValue(token, out var user) ? user.AvatarId : string.Empty;
    }

    public void AddOrUpdateNickname(string token, string nickname)
    {
        _users.AddOrUpdate(
            token,
            new ApplicationUser { Token = token, Nickname = nickname },
            (key, existingUser) =>
            {
                existingUser.Nickname = nickname;
                return existingUser;
            });
    }
    public void AddOrUpdateAvatarId(string token, string avatarId)
    {
        _users.AddOrUpdate(
            token,
            new ApplicationUser { Token = token, Nickname = "user", AvatarId = avatarId },
            (key, existingUser) =>
            {
                existingUser.AvatarId = avatarId;
                return existingUser;
            });
    }

    public void UpdateConnectionId(string token, string connectionId)
    {
        _users.AddOrUpdate(
            token,
            new ApplicationUser { Token = token, LastConnectionId = connectionId },
            (key, existingUser) =>
            {
                existingUser.LastConnectionId = connectionId;
                return existingUser;
            });
    }

    public string? GetTokenFromConnectionId(string connectionId)
    {
        return _users.Values.FirstOrDefault(user => user.LastConnectionId == connectionId)?.Token;
    }
}

public class ApplicationUser
{
    public string Token { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public string AvatarId { get; set; } = string.Empty;
    public string LastConnectionId { get; set; } = string.Empty;
}
