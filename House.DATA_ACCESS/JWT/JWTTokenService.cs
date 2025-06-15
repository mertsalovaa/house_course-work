using House.DATA_ACCESS.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.JWT
{
    public class JWTTokenService : IJWTTokenService
    {
        private readonly EFContext context;
        private readonly IConfiguration configuration;
        private readonly UserManager<User> userManager;

        public JWTTokenService(
            EFContext _context,
            IConfiguration _configuration,
            UserManager<User> _userManager)
        {
            configuration = _configuration;
            context = _context;
            userManager = _userManager;
        }

        public string CreateToken(User user)
        {
            var roles = userManager.GetRolesAsync(user).Result;
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email.ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("roles", role));
            }

            var jwtTokenSecretKey = configuration["SecretPhrase"];
            var signInKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenSecretKey));
            var signInCredentials = new SigningCredentials(signInKey, SecurityAlgorithms.HmacSha256);

            var jwt = new JwtSecurityToken(
                    signingCredentials: signInCredentials,
                    claims: claims,
                    expires: DateTime.Now.AddDays(1)
                );

            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }
    }
}
