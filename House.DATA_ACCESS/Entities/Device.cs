using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.Entities
{
    public class Device
    {
        [Key]
        public int Id { get; set; }

        public string DisplayName { get; set; }
        [Required]
        public string HardwareId { get; set; }

        public string? UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }

        public virtual ICollection<HouseState> HouseStates { get; set; } = new List<HouseState>();
    }
}
