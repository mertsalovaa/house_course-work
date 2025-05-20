using House.DATA_ACCESS.Entities;
using House.DATA_ACCESS;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using House.DATA_ACCESS.JWT;
using House.DATA_ACCESS.DTO;
using System.Data.Entity.Core.Common.CommandTrees.ExpressionBuilder;
using System;
using System.Data;
using System.Security.Claims;

namespace House.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HouseController : ControllerBase
    {
        private readonly EFContext context;
        private readonly UserManager<User> userManager;

        public HouseController(
            EFContext _context,
            UserManager<User> _userManager)
        {
            this.context = _context;
            this.userManager = _userManager;

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

        [HttpGet("get-lastData-data")]
        public async Task<HouseStateDTO> GetLastData()
        {
            var lastData = context.HouseStates.OrderBy(x => x.Id).LastOrDefault();
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await userManager.FindByIdAsync(userId);

            return new HouseStateDTO()
            {
                Id = lastData!.Id,
                Temperature = lastData.Temperature.ToString(),
                Humidity = lastData.Humidity.ToString(),
                Gas = lastData.Gas.ToString(),
                UserEmail = user.Email,
                DeviceName = lastData.DeviceId.ToString(),
                DateTime = $"{lastData.CurrentDate.Day}/{lastData.CurrentDate.Month}/{lastData.CurrentDate.Year} {lastData.CurrentDate.ToLongTimeString()}",
                Status = GetHouseStatus(lastData, user)
            };
        }

        private static string GetHouseStatus(HouseState? last, User? user)
        {
            if (last.Temperature > user!.TemperatureNormal + 2 ||
                last.Temperature < user.TemperatureNormal - 2 ||
                last.Humidity < user.HumidityNormal - 10 ||
                last.Humidity > user.HumidityNormal + 10)
            {
                return "Something's not in your normal.";
            }
            else
            {
                return "Everything's in normal period !";
            }
        }

        private static float GetFloat(string str)
        {
            return float.Parse(str.Replace('.', ','));
        }

        [HttpPost("add-new-state")]
        public HouseState AddNewState([FromBody] HouseStateDTO data)
        {
            HouseState houseState = new HouseState()
            {
                Temperature = float.Parse(data.Temperature),
                Humidity = float.Parse(data.Humidity),
                CurrentDate = DateTime.Now,
                Gas = float.Parse(data.Gas),
                DeviceId = 1
            };
            context.HouseStates.Add(houseState);
            context.SaveChanges();
            return houseState;
        }
    }
}
