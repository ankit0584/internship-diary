using Dapper;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiaryController : ControllerBase
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DiaryController(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // --------------------------------------------------
        // POST /api/diary
        // Student adds a new diary entry
        // --------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> CreateEntry([FromBody] CreateDiaryEntryRequest request)
        {
            if (request.InternshipId <= 0)
                return BadRequest(new { message = "Valid InternshipId is required." });

            if (string.IsNullOrWhiteSpace(request.WorkDescription))
                return BadRequest(new { message = "Work description is required." });

            if (string.IsNullOrWhiteSpace(request.PeriodStartDate) ||
                string.IsNullOrWhiteSpace(request.PeriodEndDate))
                return BadRequest(new { message = "Start and end dates are required." });

            using var connection = _connectionFactory.CreateConnection();

            var internship = await connection.QueryFirstOrDefaultAsync<Internship>(
                "SELECT * FROM internships WHERE id = @InternshipId",
                new { request.InternshipId }
            );

            if (internship == null)
                return NotFound(new { message = "Internship not found." });

            // Check for overlapping entry dates
            var overlap = await connection.QueryFirstOrDefaultAsync(
                @"SELECT id FROM diary_entries 
                  WHERE internship_id = @InternshipId
                  AND period_start_date < @PeriodEndDate 
                  AND period_end_date > @PeriodStartDate",
                new
                {
                    request.InternshipId,
                    request.PeriodStartDate,
                    request.PeriodEndDate
                }
            );

            if (overlap != null)
                return Conflict(new { message = "A diary entry already exists for this date range." });

            var sql = @"INSERT INTO diary_entries 
                        (internship_id, period_start_date, period_end_date, work_description)
                        VALUES 
                        (@InternshipId, @PeriodStartDate, @PeriodEndDate, @WorkDescription)";

            await connection.ExecuteAsync(sql, new
            {
                request.InternshipId,
                request.PeriodStartDate,
                request.PeriodEndDate,
                request.WorkDescription
            });

            return Ok(new { message = "Diary entry added successfully." });
        }

        // --------------------------------------------------
        // GET /api/diary/internship/{internshipId}
        // Get all diary entries for an internship
        // --------------------------------------------------
        [HttpGet("internship/{internshipId}")]
        public async Task<IActionResult> GetEntriesByInternship(int internshipId)
        {
            using var connection = _connectionFactory.CreateConnection();

            var entries = await connection.QueryAsync<DiaryEntry>(
                @"SELECT 
                    id AS Id,
                    internship_id AS InternshipId,
                    period_start_date AS PeriodStartDate,
                    period_end_date AS PeriodEndDate,
                    work_description AS WorkDescription,
                    staff_status AS StaffStatus,
                    staff_remarks AS StaffRemarks,
                    reviewed_by AS ReviewedBy,
                    reviewed_at AS ReviewedAt,
                    created_at AS CreatedAt
                  FROM diary_entries 
                  WHERE internship_id = @internshipId 
                  ORDER BY period_start_date ASC",
                new { internshipId }
            );

            return Ok(entries);
        }

        // --------------------------------------------------
        // GET /api/diary/{id}
        // Get a single diary entry
        // --------------------------------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEntry(int id)
        {
            using var connection = _connectionFactory.CreateConnection();

            var entry = await connection.QueryFirstOrDefaultAsync<DiaryEntry>(
                @"SELECT 
                    id AS Id,
                    internship_id AS InternshipId,
                    period_start_date AS PeriodStartDate,
                    period_end_date AS PeriodEndDate,
                    work_description AS WorkDescription,
                    staff_status AS StaffStatus,
                    staff_remarks AS StaffRemarks,
                    reviewed_by AS ReviewedBy,
                    reviewed_at AS ReviewedAt,
                    created_at AS CreatedAt
                  FROM diary_entries 
                  WHERE id = @id",
                new { id }
            );

            if (entry == null)
                return NotFound(new { message = "Diary entry not found." });

            return Ok(entry);
        }

        // --------------------------------------------------
        // PUT /api/diary/{id}/review
        // Staff reviews a diary entry
        // --------------------------------------------------
        [HttpPut("{id}/review")]
        public async Task<IActionResult> ReviewEntry(int id, [FromBody] ReviewEntryRequest request)
        {
            if (request.StaffStatus != "approved" && request.StaffStatus != "needs_revision")
                return BadRequest(new { message = "Status must be 'approved' or 'needs_revision'." });

            if (request.ReviewedBy <= 0)
                return BadRequest(new { message = "Valid ReviewedBy (staff user id) is required." });

            using var connection = _connectionFactory.CreateConnection();

            var entry = await connection.QueryFirstOrDefaultAsync<DiaryEntry>(
                "SELECT * FROM diary_entries WHERE id = @id",
                new { id }
            );

            if (entry == null)
                return NotFound(new { message = "Diary entry not found." });

            var staff = await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM users WHERE id = @ReviewedBy AND role = 'staff'",
                new { request.ReviewedBy }
            );

            if (staff == null)
                return NotFound(new { message = "Staff member not found." });

            var sql = @"UPDATE diary_entries 
                        SET staff_status = @StaffStatus,
                            staff_remarks = @StaffRemarks,
                            reviewed_by = @ReviewedBy,
                            reviewed_at = @ReviewedAt
                        WHERE id = @Id";

            await connection.ExecuteAsync(sql, new
            {
                request.StaffStatus,
                request.StaffRemarks,
                request.ReviewedBy,
                ReviewedAt = DateTime.UtcNow,
                Id = id
            });

            return Ok(new { message = $"Entry marked as '{request.StaffStatus}' successfully." });
        }
    }

    // --------------------------------------------------
    // Request models
    // --------------------------------------------------
    public class CreateDiaryEntryRequest
    {
        public int InternshipId { get; set; }
        public string PeriodStartDate { get; set; } = string.Empty;
        public string PeriodEndDate { get; set; } = string.Empty;
        public string WorkDescription { get; set; } = string.Empty;
    }

    public class ReviewEntryRequest
    {
        public string StaffStatus { get; set; } = string.Empty;
        public string? StaffRemarks { get; set; }
        public int ReviewedBy { get; set; }
    }
}