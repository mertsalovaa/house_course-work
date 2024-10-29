using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.DTO
{
    public class ArchiveDTO
    {
        public int Id { get; set; }
        public HouseStateDTO HouseState { get; set; } = new HouseStateDTO();
    }
}
