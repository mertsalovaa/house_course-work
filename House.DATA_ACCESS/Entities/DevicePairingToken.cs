using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.Entities
{
    public class DevicePairingToken
    {
        [Key]
        public int Id { get; set; }
        
        public string Token { get; set; } = String.Empty;   // pairing token
        
        public string UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }

        public int? DeviceId { get; set; } // Nullable!
        [ForeignKey(nameof(DeviceId))]
        public virtual Device Device { get; set; }                                            
        
        public DateTime CreatedAt { get; set; }

        public bool IsConfirmed { get; set; } = false;
    }
}
