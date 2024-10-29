using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace House.DATA_ACCESS.Migrations
{
    /// <inheritdoc />
    public partial class third : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateTime",
                table: "HouseStates",
                newName: "CurrentDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CurrentDate",
                table: "HouseStates",
                newName: "DateTime");
        }
    }
}
