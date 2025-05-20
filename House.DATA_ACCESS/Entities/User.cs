using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.Entities
{
    public class User : IdentityUser
    {
        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public float TemperatureNormal { get; set; }

        [Required]
        public float HumidityNormal { get; set; }

        [Required]
        public float GasNormal { get; set; }
        
        public virtual ICollection<Device> Devices { get; set; } = new List<Device>();
        
        public string Notes { get; set; } = string.Empty;
    }
}
