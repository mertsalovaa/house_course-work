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
        public string Temperature { get; set; } = string.Empty;

        [Required]
        public string Humidity { get; set; } = string.Empty;

        [Required]
        public string Gas { get; set; } = string.Empty;

        [Required]
        public DateTime CurrentDate { get; set; }

        public string UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }
}
