using System.Collections.Concurrent;
using System.Linq;

public interface IUserService
{
    public User GetOrCreateUser(string token);
    public UserInfoModel? GetUserInfo(string token);
}

public class UserService : IUserService
{
    private static readonly ConcurrentDictionary<string, User> _users = new();
    public User GetOrCreateUser(string token)
    {
        return _users.GetOrAdd(token, new User { Token = token });
    }
    public UserInfoModel? GetUserInfo(string token)
    {
        if (!_users.ContainsKey(token))
        {
            return null;
        }
        var user = _users[token];
        return new UserInfoModel { Name = user.Name, AvatarId = user.AvatarId };
    }

}
