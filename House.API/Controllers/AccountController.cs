using House.DATA_ACCESS.Entities;
using House.DATA_ACCESS.JWT;
using House.DATA_ACCESS;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using House.DATA_ACCESS.DTO.Result;
using System.Data;
using House.DATA_ACCESS.DTO.Account;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using Azure.Core;
using House.API.hubs;
using Microsoft.EntityFrameworkCore;
using System;

namespace House.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly EFContext context;
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private readonly IJWTTokenService jwtTokenService;
        private readonly IHubContext<PairingHub> hubContext;
        private static readonly Random random = new Random();

        public AccountController(
            EFContext _context,
            UserManager<User> _userManager,
            SignInManager<User> _signInManager,
            IJWTTokenService _jwtTokenService,
            IHubContext<PairingHub> _hubContext
            )
        {
            this.context = _context;
            this.userManager = _userManager;
            this.signInManager = _signInManager;
            this.jwtTokenService = _jwtTokenService;
            this.hubContext = _hubContext;
        }

        [HttpPost("login")]
        public async Task<ResultDTO> Login([FromBody] LoginDTO model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return new ResultErrorDTO
                    {
                        Message = "ERROR",
                        Status = 401,
                        Errors = CustomValidator.getErrorsByModel(ModelState)
                    };
                }
                var findUser = context.Users.FirstOrDefault(x => x.Email == model.Email);
                if (findUser == null)
                {
                    return new ResultErrorDTO
                    {
                        Status = 403,
                        Message = "ERROR",
                        Errors = new List<string> { "Неправильний email або пароль." }
                    };
                }
                var result = await signInManager.PasswordSignInAsync(findUser, model.Password, false, false);

                if (!result.Succeeded)
                {
                    return new ResultErrorDTO
                    {
                        Status = 403,
                        Message = "ERROR",
                        Errors = new List<string> { "Неправильний email або пароль." }
                    };
                }
                else
                {
                    var user = await userManager.FindByIdAsync(findUser.Id);
                    await signInManager.SignInAsync(user, false);

                    return new ResultLoginDTO
                    {
                        Status = 200,
                        Message = "OK",
                        Token = jwtTokenService.CreateToken(user)
                    };
                }
            }
            catch (Exception e)
            {
                return new ResultErrorDTO
                {
                    Status = 500,
                    Message = "ERROR",
                    Errors = new List<string> { e.Message }
                };
            }
        }


        [HttpPost("register")]
        public async Task<ResultDTO> Register([FromBody] RegisterDTO model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return new ResultErrorDTO()
                    {
                        Status = 401,
                        Message = "ERROR",
                        Errors = CustomValidator.getErrorsByModel(ModelState)
                    };
                }

                var user = new User()
                {
                    UserName = model.UserName,
                    Email = model.Email,
                    PhoneNumber = model.Phone,
                    Notes = model.Notes,
                    Address = model.Address,
                    TemperatureNormal = float.Parse(model.TempNorma),
                    HumidityNormal = float.Parse(model.HumidNorma),
                    GasNormal = 100f
                };


                IdentityResult result = await userManager.CreateAsync(user, model.Password);
                result = await userManager.AddToRoleAsync(user, "user");

                if (result.Succeeded)
                {
                    context.Users.Attach(user);
                    await context.SaveChangesAsync();

                    return new ResultDTO()
                    {
                        Message = "OK",
                        Status = 200
                    };
                }
                else
                {
                    return new ResultErrorDTO()
                    {
                        Message = "ERROR",
                        Status = 403,
                        Errors = CustomValidator.getErrorsByIdentityResult(result)
                    };
                }


            }
            catch (Exception e)
            {
                return new ResultErrorDTO
                {
                    Status = 500,
                    Message = e.Message,
                    Errors = new List<string>()
                    {
                        e.Message
                    }
                };
            }

        }

        // Генерація 6-символьний pairing-токену з допустимих символів
        private string GenerateToken()
        {
            const int length = 6;
            const string chars = "234679ABCEFXGHJKLUNPTS";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        [Authorize]
        [HttpGet("get-pairing-token")]
        public async Task<string> GeneratePairingToken()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var random = new Random();
            string token = GenerateToken();
            var currentTokenByUser = await context.PairingTokens.FirstOrDefaultAsync(x => x.UserId == userId);
            if (currentTokenByUser != null)
            {
                if (currentTokenByUser.CreatedAt.Date.Equals(DateTime.Now.Date))
                {
                    return currentTokenByUser.Token;
                }

                currentTokenByUser.Token = token;
                currentTokenByUser.CreatedAt = DateTime.Now;
                currentTokenByUser.IsConfirmed = false;
                currentTokenByUser.DeviceId = null;

                context.PairingTokens.Update(currentTokenByUser);
            }
            else
            {
                var pairingToken = new DevicePairingToken()
                {
                    UserId = userId,
                    CreatedAt = DateTime.Now,
                    IsConfirmed = false,
                    Token = token
                };
                context.PairingTokens.Add(pairingToken);
            }

            await context.SaveChangesAsync();
            return token;
        }

        [Authorize]
        [HttpGet("is-confirmed-connect")]
        public async Task<ResultDTO> IsConfirmedConnect([FromQuery] bool isConfirmed)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);

            var pairingToken = await context.PairingTokens.FirstOrDefaultAsync(x => x.UserId == user.Id);

            if (pairingToken == null)
                return new ResultDTO { Status = 404, Message = "Токен не знайдено." };

            var confirmedDevice = await context.Devices.FirstOrDefaultAsync(x => x.Id == pairingToken.DeviceId);

            if (confirmedDevice == null)
                return new ResultDTO { Status = 404, Message = "Пристрій не знайдено." };
            
            pairingToken.IsConfirmed = isConfirmed;
            
            if (isConfirmed)
            {
                confirmedDevice.User = user;
                confirmedDevice.UserId = user.Id;

                pairingToken.DeviceId = confirmedDevice.Id;
                context.Devices.Update(confirmedDevice);
                context.PairingTokens.Update(pairingToken);
                await context.SaveChangesAsync();

                return new ResultDTO()
                {
                    Status = 200,
                    Message = $"Користувач {user.UserName} успішно додав {confirmedDevice.HardwareId}!"
                };
            }
            else
            {
                context.Devices.Remove(confirmedDevice);
                await context.SaveChangesAsync();

                return new ResultDTO()
                {
                    Status = 400,
                    Message = $"Спроба з'єднання з пристроєм {confirmedDevice.HardwareId} відхилена!"
                };
            }
        }

        [HttpGet("is-correct-token")]
        public async Task<ResultDTO> IsCorrectToken([FromQuery] string token, string hardwareId)
        {

            var pairingToken = await context.PairingTokens.FirstOrDefaultAsync(x => x.Token == token);
            if (pairingToken != null)
            {
                if (await context.Devices.AnyAsync(x => x.HardwareId == hardwareId))
                {
                    return new ResultDTO()
                    {
                        Status = 409,
                        Message = "Device already added."
                    };
                }

                var user = await context.Users.FirstOrDefaultAsync(x => x.Id == pairingToken.UserId);
                var newDevice = new Device()
                {
                    HardwareId = hardwareId,
                    DisplayName = $"Пристрій #{context.Devices.Where(x => x.UserId == pairingToken.UserId).Count() + 1}"
                };
                context.Devices.Add(newDevice);
                await context.SaveChangesAsync();

                pairingToken.DeviceId = newDevice.Id;
                context.PairingTokens.Update(pairingToken);

                await context.SaveChangesAsync();

                await hubContext.Clients.User(user.Id).SendAsync("DevicePaired", new
                {
                    deviceId = pairingToken.DeviceId,
                    hardwareId = newDevice.HardwareId,
                    message = "Пристрій хоче підключитись."
                });

                return new ResultDTO()
                {
                    Status = 200,
                    Message = "Token found, device added."
                };
            }
            else
            {
                return new ResultDTO()
                {
                    Status = 404,
                    Message = "Invalid token, try again!"
                };
            }
        }

        [Authorize]
        [HttpPost("set-user-normas")]
        public async Task<ResultDTO> SetUserNormas([FromBody] SettingNormas data)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            user.TemperatureNormal = float.Parse(data.Temperature);
            user.HumidityNormal = float.Parse(data.Humidity);
            user.GasNormal = float.Parse(data.Gas);
            await context.SaveChangesAsync();

            return new ResultDTO()
            {
                Status = 200,
                Message = "OK"
            };
        }

        [Authorize]
        [HttpGet("get-user-info")]
        public async Task<UserDTO> GetUserInfo()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await userManager.FindByIdAsync(userId);

            return new UserDTO()
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Phone = user.PhoneNumber,
                Address = user.Address,
                Notes = user.Notes,
                TempNorma = user.TemperatureNormal.ToString(),
                HumidNorma = user.HumidityNormal.ToString()
                //GasNorma = user.GasNormal.ToString()
            };
        }

        [Authorize]
        [HttpGet("get-normas-by-email")]
        public async Task<SettingNormas> GetNormasById([FromQuery] string email)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await userManager.FindByIdAsync(userId);

            return new SettingNormas()
            {
                User = user.Email,
                Temperature = user.TemperatureNormal.ToString(),
                Humidity = user.HumidityNormal.ToString(),
                Gas = user.GasNormal.ToString()
            };
        }



        //{
        //  "id": "string",
        //  "userName": "i'm oleg",
        //  "email": "oleg@gmail.com",
        //  "address": "my address",
        //  "phone": "+3800000000",
        //  "notes": "Щось важливе про мій будинок",
        //  "tempNorma": "22",
        //  "humidNorma": "45.5",
        //  "gasNorma": "100",
        //  "password": "Qwerty1!"
        //}
    }

}