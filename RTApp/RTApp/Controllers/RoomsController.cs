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
    }
}
