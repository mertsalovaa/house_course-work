using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.Entities
{
    public class HouseState
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public float Temperature { get; set; }

        [Required]
        public float Humidity { get; set; }

        [Required]
        public float Gas { get; set; }

        [Required]
        public DateTime CurrentDate { get; set; }

        public int DeviceId { get; set; }
        [ForeignKey(nameof(DeviceId))]
        public virtual Device Device { get; set; }
    }
}
