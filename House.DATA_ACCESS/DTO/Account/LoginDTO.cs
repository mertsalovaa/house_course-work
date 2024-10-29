using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace House.DATA_ACCESS.DTO.Account
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Поле «Електронна адреса» є обов'язковим")]
        [EmailAddress(ErrorMessage = "Некоректна електронна адреса")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Поле «Пароль» є обов'язковим")]
        public string Password { get; set; } = string.Empty;
    }
}
