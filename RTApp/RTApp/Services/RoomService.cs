public interface IRoomService
{

}
public class RoomService : IRoomService
{

}
public class Room
{
    required public string Name { get; set; }
    required public User Admin { get; set; }
    public List<User> Users { get; set; } = [];
}
public class User
{
    required public string Token { get; set; }
    public string? Name { get; set; }
    public string? AvatarId { get; set; }

}