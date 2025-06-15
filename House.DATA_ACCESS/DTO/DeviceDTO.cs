using House.DATA_ACCESS.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.DTO
{
    public class DeviceDTO
    {
        public int Id { get; set; }
        public string DisplayName { get; set; }
        public string HardwareId { get; set; }
        public DateTime? LastActivity { get; set; }
        public DateTime? DataOfCreating { get; set; }
        public string Email { get; set; }
        public ICollection<HouseStateDTO> HouseStates { get; set; } = new List<HouseStateDTO>();
    }
}
