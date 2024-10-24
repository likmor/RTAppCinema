public class UserInfoModel
{
    required public string? Name { get; set; }
    required public string? AvatarId { get; set; }
    public bool? Online { get; set; }
    public bool? Owner { get; set; }
}