using House.DATA_ACCESS.Entities;
using House.DATA_ACCESS;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using House.DATA_ACCESS.JWT;
using House.DATA_ACCESS.DTO;

namespace House.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HouseController : ControllerBase
    {
        //private static readonly string[] Summaries = new[]
        //{
        //    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        //};

        private readonly EFContext context;
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private readonly IJWTTokenService jwtTokenService;

        public HouseController(
            EFContext _context,
            UserManager<User> _userManager,
            SignInManager<User> _signInManager,
            IJWTTokenService _jwtTokenService
            )
        {
            this.context = _context;
            this.userManager = _userManager;
            this.signInManager = _signInManager;
            this.jwtTokenService = _jwtTokenService;

            var archiveStates = context.HouseStates.Where(x => x.CurrentDate.Date != DateTime.Now.Date).ToList();
            var archive = new List<Archive>();
            foreach (var item in archiveStates)
            {
                if (!context.Archive.Any(x => x.HouseStateId == item.Id))
                {
                    archive.Add(new Archive()
                    {
                        HouseStateId = item.Id
                    });
                }
            }
            if (archive.Any())
            {
                context.Archive.AddRange(archive);
                context.SaveChanges();
            }
        }

        [HttpGet("get-house-states")]
        public List<HouseState> GetArchive()
        {
            return context.HouseStates.Where(x => x.CurrentDate.Date != DateTime.Now.Date).ToList();
        }

        [HttpPost("add-new-state")]
        public HouseState AddNewState([FromBody] HouseStateDTO data)
        {
            HouseState houseState = new HouseState()
            {
                Temperature = data.Temperature,
                Humidity = data.Humidity,
                CurrentDate = DateTime.Now,
                Gas = data.Gas,
                UserId = "503163c1-13fe-441b-bf33-4c7af8257b3d"
            };
            context.HouseStates.Add(houseState);
            context.SaveChanges();
            return houseState;
        }
    }
}
