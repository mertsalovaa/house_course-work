using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS
{
    public class EFContextFactory : IDesignTimeDbContextFactory<EFContext>
    {
        public EFContext CreateDbContext(string[] args = null)
        {
            var optionsBuilder = new DbContextOptionsBuilder<EFContext>();

            // Вказуємо рядок з'єднання безпосередньо
            optionsBuilder.UseSqlServer(@"Data Source=(localdb)\\MSSQLLocalDB;Database=HouseDb;Trusted_Connection=True;");

            return new EFContext(optionsBuilder.Options);
        }
    }
}
