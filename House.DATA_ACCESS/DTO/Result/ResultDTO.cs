using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.DTO.Result
{
    public class ResultDTO
    {
        public int Status { get; set; }
        public string Message { get; set; } = string.Empty;
    }


    public class ResultErrorDTO : ResultDTO
    {
        public List<string> Errors { get; set; } = new List<string>();
    }


    public class ResultLoginDTO : ResultDTO
    {
        public string Token { get; set; } = string.Empty;
    }
}
