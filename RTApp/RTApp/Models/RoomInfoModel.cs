public class RoomInfoModel
{
    required public string Name { get; set; }
    required public UserInfoModel? Admin {  get; set; }
    required public IEnumerable<UserInfoModel?> Users { get; set; }
    required public bool Deletable { get; set; }
}