using Dapper;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InternshipController : ControllerBase
    {
        private readonly DbConnectionFactory _connectionFactory;

        public InternshipController(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // --------------------------------------------------
        // POST /api/internship
        // Student creates their internship profile
        // --------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> CreateInternship([FromBody] CreateInternshipRequest request)
        {
            if (request.StudentId <= 0)
                return BadRequest(new { message = "Valid StudentId is required." });

            if (string.IsNullOrWhiteSpace(request.OrgName) ||
                string.IsNullOrWhiteSpace(request.MentorName))
                return BadRequest(new { message = "Organization name and mentor name are required." });

            using var connection = _connectionFactory.CreateConnection();

            var student = await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM users WHERE id = @StudentId AND role = 'student'",
                new { request.StudentId }
            );

            if (student == null)
                return NotFound(new { message = "Student not found." });

            var existing = await connection.QueryFirstOrDefaultAsync<Internship>(
                "SELECT * FROM internships WHERE student_id = @StudentId",
                new { request.StudentId }
            );

            if (existing != null)
                return Conflict(new { message = "Internship profile already exists for this student." });

            var sql = @"INSERT INTO internships 
                        (student_id, org_name, org_address, org_contact,
                         mentor_name, mentor_designation, mentor_contact, mentor_email,
                         start_date, end_date)
                        VALUES 
                        (@StudentId, @OrgName, @OrgAddress, @OrgContact,
                         @MentorName, @MentorDesignation, @MentorContact, @MentorEmail,
                         @StartDate, @EndDate)";

            await connection.ExecuteAsync(sql, new
            {
                request.StudentId,
                request.OrgName,
                request.OrgAddress,
                request.OrgContact,
                request.MentorName,
                request.MentorDesignation,
                request.MentorContact,
                request.MentorEmail,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            });

            return Ok(new { message = "Internship profile created successfully." });
        }

        // --------------------------------------------------
        // GET /api/internship/my/{studentId}
        // Student views their own internship profile
        // --------------------------------------------------
        [HttpGet("my/{studentId}")]
        public async Task<IActionResult> GetMyInternship(int studentId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var internship = await connection.QueryFirstOrDefaultAsync<Internship>(
                @"SELECT 
                    id AS Id,
                    student_id AS StudentId,
                    org_name AS OrgName,
                    org_address AS OrgAddress,
                    org_contact AS OrgContact,
                    mentor_name AS MentorName,
                    mentor_designation AS MentorDesignation,
                    mentor_contact AS MentorContact,
                    mentor_email AS MentorEmail,
                    start_date AS StartDate,
                    end_date AS EndDate,
                    mentor_video_path AS MentorVideoPath,
                    mentor_video_uploaded_at AS MentorVideoUploadedAt,
                    overall_status AS OverallStatus,
                    created_at AS CreatedAt
                  FROM internships 
                  WHERE student_id = @studentId",
                new { studentId }
            );

            if (internship == null)
                return NotFound(new { message = "No internship profile found for this student." });

            return Ok(internship);
        }

        // --------------------------------------------------
        // GET /api/internship/all
        // Staff views all students' internship profiles
        // --------------------------------------------------
        [HttpGet("all")]
        public async Task<IActionResult> GetAllInternships()
        {
            using var connection = _connectionFactory.CreateConnection();

            var sql = @"SELECT 
                            i.id AS Id,
                            i.student_id AS StudentId,
                            i.org_name AS OrgName,
                            i.org_address AS OrgAddress,
                            i.org_contact AS OrgContact,
                            i.mentor_name AS MentorName,
                            i.mentor_designation AS MentorDesignation,
                            i.mentor_contact AS MentorContact,
                            i.mentor_email AS MentorEmail,
                            i.start_date AS StartDate,
                            i.end_date AS EndDate,
                            i.mentor_video_path AS MentorVideoPath,
                            i.mentor_video_uploaded_at AS MentorVideoUploadedAt,
                            i.overall_status AS OverallStatus,
                            i.created_at AS CreatedAt,
                            u.name AS StudentName,
                            u.email AS StudentEmail
                        FROM internships i
                        JOIN users u ON i.student_id = u.id
                        ORDER BY i.created_at DESC";

            var internships = await connection.QueryAsync(sql);

            return Ok(internships);
        }

        // --------------------------------------------------
        // POST /api/internship/{id}/upload-video
        // Student uploads mentor verification video
        // --------------------------------------------------
        [HttpPost("{id}/upload-video")]

        public async Task<IActionResult> UploadMentorVideo(int id, IFormFile video)
        {
            if (video == null || video.Length == 0)
                return BadRequest(new { message = "No video file provided." });

            var allowedExtensions = new[] { ".mp4", ".mov", ".avi", ".mkv", ".webm" };
            var extension = Path.GetExtension(video.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Allowed: mp4, mov, avi, mkv, webm." });

            if (video.Length > 100 * 1024 * 1024)
                return BadRequest(new { message = "File size exceeds 100MB limit." });

            using var connection = _connectionFactory.CreateConnection();

            var internship = await connection.QueryFirstOrDefaultAsync<Internship>(
                "SELECT * FROM internships WHERE id = @id",
                new { id }
            );

            if (internship == null)
                return NotFound(new { message = "Internship not found." });

            // Create uploads folder if it doesn't exist
            var uploadsFolder = Path.Combine(
    Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)!,
    "Uploads", "Videos"
);
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var fileName = $"video_{id}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await video.CopyToAsync(stream);
            }

            var relativePath = Path.Combine("Uploads", "Videos", fileName);

            await connection.ExecuteAsync(
                @"UPDATE internships 
                  SET mentor_video_path = @MentorVideoPath,
                      mentor_video_uploaded_at = @UploadedAt,
                      overall_status = 'pending_final_review'
                  WHERE id = @Id",
                new
                {
                    MentorVideoPath = relativePath,
                    UploadedAt = DateTime.UtcNow,
                    Id = id
                }
            );

            return Ok(new
            {
                message = "Mentor verification video uploaded successfully.",
                filePath = relativePath
            });
        }
    }

    // --------------------------------------------------
    // Request model
    // --------------------------------------------------
    public class CreateInternshipRequest
    {
        public int StudentId { get; set; }
        public string OrgName { get; set; } = string.Empty;
        public string? OrgAddress { get; set; }
        public string? OrgContact { get; set; }
        public string MentorName { get; set; } = string.Empty;
        public string? MentorDesignation { get; set; }
        public string? MentorContact { get; set; }
        public string? MentorEmail { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}