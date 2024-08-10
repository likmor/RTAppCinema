using Microsoft.AspNetCore.Mvc;
using RTApp.Hubs;

namespace RTApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly ILogger<RoomsController> _logger;

        public RoomsController(ILogger<RoomsController> logger)
        {
            _logger = logger;
        }
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetRooms()
        {
            return Ok(RoomHub.RoomMembers.Keys);
        }

    }
}
