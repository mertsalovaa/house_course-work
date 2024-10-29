using House.DATA_ACCESS.Entities;
using House.DATA_ACCESS.JWT;
using House.DATA_ACCESS;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using House.DATA_ACCESS.DTO.Result;
using System.Data;
using House.DATA_ACCESS.DTO.Account;

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

        public AccountController(
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
                var result = signInManager.PasswordSignInAsync(findUser, model.Password, false, false).Result;

                if (!result.Succeeded)
                {
                    return new ResultErrorDTO
                    {
                        Status = 403,
                        Message = "ERROR",
                        Errors = new List<string> { "Incorrect email or password" }
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


        [HttpPost("set-user-normas")]
        public ResultDTO SetUserNormas([FromBody] SettingNormas data)
        {
            var user = context.Users.FirstOrDefault(x => x.Email == data.User);
            user.TemperatureNormal = float.Parse(data.Temperature);
            user.HumidityNormal = float.Parse(data.Humidity);
            user.GasNormal = float.Parse(data.Gas);
            context.SaveChanges();

            return new ResultDTO()
            {
                Status = 200,
                Message = "OK"
            };
        }

        [HttpGet("get-user-info")]
        public UserDTO GetUserInfo([FromQuery] string email)
        {
            var user = context.Users.FirstOrDefault(u => u.Email == email);
            return new UserDTO()
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Phone = user.PhoneNumber,
                Address = user.Address,
                Notes = user.Notes,
                TempNorma = user.TemperatureNormal.ToString(),
                HumidNorma = user.HumidityNormal.ToString(),
                GasNorma = user.GasNormal.ToString()
            };
        }

        [HttpGet("get-normas-by-email")]
        public SettingNormas GetNormasById([FromQuery] string email)
        {
            var user = context.Users.FirstOrDefault(u => u.Email == email);
            
            return new SettingNormas()
            {
                User = user.Email,
                Temperature = user.TemperatureNormal.ToString(),
                Humidity = user.HumidityNormal.ToString(),
                Gas = user.GasNormal.ToString()
            };
        }

        // registration ?????

        //[HttpPost("register")]
        //public async Task<ResultDTO> Register([FromBody] RegisterDTO model)
        //{
        //    try
        //    {
        //        if (!ModelState.IsValid)
        //        {
        //            return new ResultErrorDTO()
        //            {
        //                Status = 401,
        //                Message = "ERROR",
        //                Errors = CustomValidator.getErrorsByModel(ModelState)
        //            };
        //        }

        //        var user = new User()
        //        {
        //            UserName = model.Email,
        //            Email = model.Email,
        //            PhoneNumber = model.Phone,
        //            FullName = model.FullName,
        //            BirthDate = model.BirthDate,
        //            Address = model.Address
        //        };


        //        IdentityResult result = await _userManager.CreateAsync(user, model.Password);
        //        result = await _userManager.AddToRoleAsync(user, model.Role);

        //        if (result.Succeeded)
        //        {
        //            if (model.Role == Roles.Customer)
        //            {
        //                result = _userManager.AddToRoleAsync(user, Roles.Customer).Result;
        //                _context.Users.Attach(user);
        //                _context.SaveChanges();
        //            }
        //            if (model.Role == Roles.Employee)
        //            {
        //                result = _userManager.AddToRoleAsync(user, Roles.Employee).Result;
        //                _context.Users.Attach(user);
        //                _context.Employees.Add(
        //                    new Employee()
        //                    {
        //                        Id = user.Id,
        //                        UserId = user.Id,
        //                        User = user
        //                    });
        //                _context.SaveChanges();
        //            }
        //            return new ResultDTO()
        //            {
        //                Message = "OK",
        //                Status = 200
        //            };
        //        }
        //        else
        //        {
        //            return new ResultErrorDTO()
        //            {
        //                Message = "ERROR",
        //                Status = 403,
        //                Errors = CustomValidator.getErrorsByIdentityResult(result)
        //            };
        //        }


        //    }
        //    catch (Exception e)
        //    {
        //        return new ResultErrorDTO
        //        {
        //            Status = 500,
        //            Message = e.Message,
        //            Errors = new List<string>()
        //            {
        //                e.Message
        //            }
        //        };
        //    }

        //}
    }
}
