using House.DATA_ACCESS.Entities;
using House.DATA_ACCESS;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using House.DATA_ACCESS.JWT;
using House.DATA_ACCESS.DTO;
using System.Data.Entity.Core.Common.CommandTrees.ExpressionBuilder;
using System;
using System.Data;

namespace House.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HouseController : ControllerBase
    {        
        private readonly EFContext context;

        public HouseController(
            EFContext _context
            )
        {
            this.context = _context;

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

        [HttpGet("get-last-data")]
        public HouseStateDTO GetLastData()
        {
            var last = context.HouseStates.OrderBy(x => x.Id).LastOrDefault();
            var user = context.Users.FirstOrDefault(x => x.Id == last!.UserId);

            return new HouseStateDTO()
            {
                Id = last!.Id,
                Temperature = last.Temperature,
                Humidity = last.Humidity,
                User = user!.UserName!,
                Gas = last.Gas,
                DateTime = $"{last.CurrentDate.Day}/{last.CurrentDate.Month}/{last.CurrentDate.Year} {last.CurrentDate.ToLongTimeString()}",
                Status = GetHouseStatus(last, user)
            };
        }

        private static string GetHouseStatus(HouseState? last, User? user)
        {
            if (GetFloat(last!.Temperature) > user!.TemperatureNormal + 2 ||
                GetFloat(last.Temperature) < user.TemperatureNormal - 2 ||
                GetFloat(last.Humidity) < user.HumidityNormal - 10 ||
                GetFloat(last.Humidity) > user.HumidityNormal + 10)
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
