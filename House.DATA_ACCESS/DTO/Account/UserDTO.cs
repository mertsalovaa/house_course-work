using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.DTO.Account
{
    public class UserDTO
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string TempNorma { get; set; } = string.Empty;
        public string HumidNorma { get; set; } = string.Empty;
        //public string GasNorma { get; set; } = string.Empty;
    }
}
