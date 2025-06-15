using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.DTO.Result
{
    public class ResultConnectDevice
    {
      
    }

    public class ResultItemDTO<T> : ResultDTO
    {
        public int Status { get; set; }
        public T Item { get; set; }
    }

}
