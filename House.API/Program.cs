using House.DATA_ACCESS;
using House.DATA_ACCESS.Entities;
using House.DATA_ACCESS.JWT;
using House.DATA_ACCESS.Seeder;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Configuration;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
IServiceCollection services = builder.Services;
services.AddDbContext<EFContext>(opt =>
                opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

services.AddIdentity<User, IdentityRole>()
                .AddEntityFrameworkStores<EFContext>()
                .AddDefaultTokenProviders();

services.AddTransient<EFContext>();

services.Configure<IdentityOptions>(opt =>
{
    opt.Password.RequiredLength = 6;
    opt.Password.RequireDigit = true;
    opt.Password.RequireLowercase = true;
    opt.Password.RequireUppercase = true;
    opt.Password.RequireNonAlphanumeric = false;
});

services.AddTransient<IJWTTokenService, JWTTokenService>();

var jwtTokenSecretKey = builder.Configuration.GetValue<string>("SecretPhrase");
var signInKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenSecretKey));

services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(cfg =>
{
    cfg.RequireHttpsMetadata = false;
    cfg.SaveToken = true;
    cfg.TokenValidationParameters = new TokenValidationParameters()
    {
        IssuerSigningKey = signInKey,
        ValidateAudience = false,
        ValidateIssuer = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors(x => x
               .AllowAnyMethod()
               .AllowAnyOrigin()
               .AllowAnyHeader());
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SeederDatabase.SeedDb(app.Services, builder.Configuration);

app.Run();