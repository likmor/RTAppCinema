using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

public class FileItem
{
    [JsonPropertyName("id")]
    public string Id { get; set; }
    [JsonPropertyName("name")]
    public string Name { get; set; }
    [JsonPropertyName("isDir")]
    public bool IsDir { get; set; }
    [JsonPropertyName("childrenIds")]
    public string[] ChildrenIds { get; set; }
    [JsonPropertyName("childrenCount")]
    public int ChildrenCount { get; set; }
    [JsonPropertyName("parentId")]

    public string ParentId {  get; set; }
}

public class Root
{
    [JsonPropertyName("rootFolderId")]
    public string RootFolderId { get; set; }
    [JsonPropertyName("fileMap")]
    public Dictionary<string, FileItem> FileMap { get; set; } = new Dictionary<string, FileItem>();
}


[ApiController]
public class FilesController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public FilesController(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    [Route("api/[controller]")]
    [HttpGet]
    public IActionResult GetFilesAndFolders()
    {
        string directoryPath = _configuration["Files:Path"];
        var result = GetFilesFromFolders(directoryPath);

        // Explicitly serialize to JSON with correct options
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        string json = JsonSerializer.Serialize(result, options);

        return Ok(json);
    }
    [Route("api/Fonts")]
    [HttpGet]
    public IActionResult GetFonts()
    {
        string directoryPath = _configuration["Fonts:Path"];
        var result = Directory.GetFiles(directoryPath).Select(file => file.Replace(directoryPath + "/", ""));

        return Ok(result);
    }

    static Root GetFilesFromFolders(string directoryPath)
    {
        var root = new Root { RootFolderId = "root" };
        try
        {
            ProcessDirectory(directoryPath, root);
        }
        catch (Exception ex)
        {
            Console.WriteLine("An error occurred: " + ex.Message);
        }

        return root;
    }

    static void ProcessDirectory(string directoryPath, Root root)
    {
        string[] directories = Directory.GetDirectories(directoryPath);
        foreach (var directory in directories)
        {
            var files = Directory.GetFiles(directory).Select(file => new FileItem
            {
                Id = $"media{directory.Replace(directoryPath, "")}/{file.Replace(directoryPath + "/", "").Replace(directory.Replace(directoryPath + "/", "") + "/", "")}",
                Name = file.Replace(directoryPath + "/", "").Replace(directory.Replace(directoryPath + "/", "") + "/", ""),
                IsDir = false,
                ChildrenIds = null,
                ChildrenCount = 0,
                ParentId = directory
            }).ToArray();

            var folder = new FileItem
            {
                Id = directory,
                Name = directory.Replace(directoryPath + "/", ""),
                IsDir = true,
                ChildrenIds = files.Select(f => f.Id).ToArray(),
                ChildrenCount = files.Length,
                ParentId = root.RootFolderId
            };

            foreach (var file in files)
            {
                root.FileMap[file.Id] = file;
            }
            root.FileMap[folder.Id] = folder;

            ProcessDirectory(directory, root);
        }
    }
}
