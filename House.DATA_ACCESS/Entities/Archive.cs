using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.Entities
{
    public class Archive
    {
        [Key]
        public int Id { get; set; }

        public int HouseStateId { get; set; }
        [ForeignKey(nameof(HouseStateId))]
        public virtual HouseState HouseState { get; set; }
    }
}
