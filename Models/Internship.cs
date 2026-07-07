using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    [Table("internships")]
    public class Internship
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("student_id")]
        [Required]
        public int StudentId { get; set; }

        [Column("org_name")]
        [Required]
        [MaxLength(150)]
        public string OrgName { get; set; } = string.Empty;

        [Column("org_address")]
        [MaxLength(255)]
        public string? OrgAddress { get; set; }

        [Column("org_contact")]
        [MaxLength(50)]
        public string? OrgContact { get; set; }

        [Column("mentor_name")]
        [Required]
        [MaxLength(100)]
        public string MentorName { get; set; } = string.Empty;

        [Column("mentor_designation")]
        [MaxLength(100)]
        public string? MentorDesignation { get; set; }

        [Column("mentor_contact")]
        [MaxLength(50)]
        public string? MentorContact { get; set; }

        [Column("mentor_email")]
        [MaxLength(150)]
        public string? MentorEmail { get; set; }

        [Column("start_date")]
        public string StartDate { get; set; } = string.Empty;

        [Column("end_date")]
        public string EndDate { get; set; } = string.Empty;

        [Column("mentor_video_path")]
        [MaxLength(255)]
        public string? MentorVideoPath { get; set; }

        [Column("mentor_video_uploaded_at")]
        public string? MentorVideoUploadedAt { get; set; }

        [Column("overall_status")]
        public string OverallStatus { get; set; } = "in_progress";

        [Column("created_at")]
        public string CreatedAt { get; set; } = string.Empty;

        public User? Student { get; set; }
        public ICollection<DiaryEntry> DiaryEntries { get; set; } = new List<DiaryEntry>();
    }
}