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
using Microsoft.AspNetCore.Authorization;
using House.API.hubs;
using Microsoft.AspNetCore.SignalR;
using House.DATA_ACCESS.DTO.Result;
using House.DATA_ACCESS.DTO.Account;

namespace House.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HouseController : ControllerBase
    {
        private readonly EFContext context;
        private readonly UserManager<User> userManager;
        private readonly IHubContext<DeviceStateHub> hubContext;

        public HouseController(
            EFContext _context,
            UserManager<User> _userManager,
            IHubContext<DeviceStateHub> _hubContext)
        {
            this.context = _context;
            this.userManager = _userManager;
            this.hubContext = _hubContext;

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

        [Authorize]
        [HttpGet("get-last-data")]
        public async Task<HouseStateDTO> GetLastData([FromQuery] int deviceId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await userManager.FindByIdAsync(userId);
            var lastData = context.HouseStates
                        .Where(x => x.DeviceId == deviceId)
                        .OrderByDescending(x => x.CurrentDate)
                        .FirstOrDefault();
            if (lastData == null)
            {
                return null;
            }
            return new HouseStateDTO()
            {
                Id = lastData!.Id,
                Temperature = lastData.Temperature.ToString(),
                Humidity = lastData.Humidity.ToString(),
                Gas = lastData.Gas.ToString(),
                UserEmail = user.Email,
                DeviceName = lastData.DeviceId.ToString(),
                DateTime = lastData.CurrentDate,
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
                return "Щось не так. Показники не у межах норм!";
            }
            else
            {
                return "Усі показники у межах норми!";
            }
        }

        private static float GetFloat(string str)
        {
            return float.Parse(str.Replace('.', ','));
        }

        //        {
        //  "id": 0,
        //  "temperature": "23",
        //  "humidity": "50",
        //  "gas": "100",
        //  "dateTime": "2025-05-28T20:02:21.015Z",
        //  "userEmail": "string",
        //  "deviceName": "arduino-mega-001",
        //  "status": "string"
        //}

        [HttpPost("add-new-state")]
        public async Task<ResultDTO> AddNewState([FromBody] HouseStateDTO data)
        {
            HouseState houseState = new HouseState()
            {
                Temperature = GetFloat(data.Temperature),
                Humidity = GetFloat(data.Humidity),
                CurrentDate = DateTime.Now,
                Gas = GetFloat(data.Gas),
                DeviceId = context.Devices.FirstOrDefault(x => x.HardwareId == data.DeviceName).Id
            };
            try
            {
                context.HouseStates.Add(houseState);
                await context.SaveChangesAsync(); // краще async

                // якщо SaveChanges пройшов — надсилаємо повідомлення
                await hubContext.Clients.User(context.PairingTokens.FirstOrDefault(x=>x.DeviceId == houseState.DeviceId).UserId).SendAsync("ReceiveNewState", new
                {
                    deviceId = houseState.DeviceId,
                    timestamp = houseState.CurrentDate
                });

                return new ResultDTO()
                {
                    Status = 200,
                    Message = "Дані додано."
                };
            }
            catch (Exception ex)
            {
                // тут можна логувати помилку
                Console.WriteLine($"Error saving state: {ex.Message}");
                // наприклад, вернути 500 з повідомленням
                HttpContext.Response.StatusCode = 500;
                return new ResultDTO()
                {
                    Status = 500,
                    Message = "Сталась помилка. Додавання скасовано."
                };
            }
        }

        [HttpGet("get-states-by-device-id")]
        public async Task<List<HouseStateDTO>> GetDataByDeviceId([FromQuery] int deviceId)
        {
            var data = context.HouseStates.Where(x => x.DeviceId == deviceId).ToList();
            if (data == null) return null;
            return data.Select(x => new HouseStateDTO
            {
                Id = x.Id,
                Temperature = x.Temperature.ToString(),
                Humidity = x.Humidity.ToString(),
                Gas = x.Gas.ToString(),
                UserEmail = context.Users.FirstOrDefault(u => u.Id == context.Devices.FirstOrDefault(d => d.Id == x.DeviceId).UserId).Email,
                DateTime = x.CurrentDate
            }).ToList();
        }
    }

}
