using House.DATA_ACCESS.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.Seeder
{
    public class SeederDatabase
    {
        public static void SeedDb(IServiceProvider services, IConfiguration config)
        {
            using (var scope = services.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                var manager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                var managerRole = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
                var context = scope.ServiceProvider.GetRequiredService<EFContext>();
                SeedData(manager, managerRole, context);
            }
        }

        public static void SeedData(UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager, EFContext context)
        {
            var roleName = "user";
            if (roleManager.FindByNameAsync(roleName).Result == null)
            {
                var resUserRole = roleManager.CreateAsync(new IdentityRole
                {
                    Name = roleName
                }).Result;

                User newUser = new User()
                {
                    UserName = "Iryna Mertsalova",
                    Email = "irynamertsalova@gmail.com",
                    PhoneNumber = "+380123456789",
                    Address = "м. Рівне, вул. Соборна, 11",
                    Notes = "Якась інформація про будинок.",
                    GasNormal = (float)150,
                    HumidityNormal = (float)50,
                    TemperatureNormal = (float)21.5
                };
                var resultUser = userManager.CreateAsync(newUser, "Qwerty1!").Result;
                resultUser = userManager.AddToRoleAsync(newUser, roleName).Result;

                context.Users.Add(newUser);
                context.SaveChanges();
                HouseState houseState = new HouseState()
                {
                    Gas = 120,
                    Temperature = (float)23.5,
                    Humidity = (float)50.2,
                    CurrentDate = DateTime.Now
                };
                context.HouseStates.Add(houseState);

                context.SaveChanges();
            }
        }
    }
}