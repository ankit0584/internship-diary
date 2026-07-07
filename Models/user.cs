using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column("email")]
        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Column("password_hash")]
        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("role")]
        [Required]
        public string Role { get; set; } = "student";

        [Column("created_at")]
        public string CreatedAt { get; set; } = string.Empty;

        public Internship? Internship { get; set; }
    }
}