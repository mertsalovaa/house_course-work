using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace House.DATA_ACCESS.Migrations
{
    /// <inheritdoc />
    public partial class updateUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "GasNormal",
                table: "AspNetUsers",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "HumidityNormal",
                table: "AspNetUsers",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "TemperatureNormal",
                table: "AspNetUsers",
                type: "real",
                nullable: false,
                defaultValue: 0f);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GasNormal",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "HumidityNormal",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TemperatureNormal",
                table: "AspNetUsers");
        }
    }
}
