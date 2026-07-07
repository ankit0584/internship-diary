using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    [Table("diary_entries")]
    public class DiaryEntry
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("internship_id")]
        [Required]
        public int InternshipId { get; set; }

        [Column("period_start_date")]
        public string PeriodStartDate { get; set; } = string.Empty;

        [Column("period_end_date")]
        public string PeriodEndDate { get; set; } = string.Empty;

        [Column("work_description")]
        [Required]
        public string WorkDescription { get; set; } = string.Empty;

        [Column("staff_status")]
        public string StaffStatus { get; set; } = "pending";

        [Column("staff_remarks")]
        [MaxLength(500)]
        public string? StaffRemarks { get; set; }

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        [Column("reviewed_at")]
        public string? ReviewedAt { get; set; }

        [Column("created_at")]
        public string CreatedAt { get; set; } = string.Empty;

        public Internship? Internship { get; set; }
        public User? Reviewer { get; set; }
    }
}