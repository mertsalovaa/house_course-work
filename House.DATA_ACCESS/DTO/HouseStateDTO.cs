﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.DTO
{
    public class HouseStateDTO
    {
        public int Id { get; set; }
        public string Temperature { get; set; } = string.Empty;
        public string Humidity { get; set; } = string.Empty;
        public string Gas { get; set; } = string.Empty;
        public string DateTime { get; set; } = string.Empty; 
        public string User { get; set; } = string.Empty;
    }
}