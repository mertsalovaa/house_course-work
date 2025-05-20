using House.DATA_ACCESS.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text.RegularExpressions;

namespace House.DATA_ACCESS
{
    public class EFContext : IdentityDbContext<User>
    {
        public EFContext(DbContextOptions<EFContext> options) : base(options) { }

        public DbSet<Device> Devices { get; set; }
        public DbSet<DevicePairingToken> PairingTokens { get; set; }
        public DbSet<HouseState> HouseStates { get; set; }
        public DbSet<Archive> Archive { get; set; }

        //protected override void OnModelCreating(ModelBuilder builder)
        //{
        //    base.OnModelCreating(builder);
        //}

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Data Source=(localdb)\MSSQLLocalDB;Database=HouseDb;Trusted_Connection=True;");
        }
    }
}
