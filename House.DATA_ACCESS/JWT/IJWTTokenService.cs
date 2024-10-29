using House.DATA_ACCESS.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.JWT
{
    public interface IJWTTokenService
    {
        string CreateToken(User user);
    }
}
