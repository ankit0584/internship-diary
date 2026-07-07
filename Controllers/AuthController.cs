using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private const string Sql = "SELECT * FROM users WHERE email = @Email and password_hash=MD5(@pass)";
        private readonly DbConnectionFactory _connectionFactory;

        // ASP.NET automatically injects DbConnectionFactory here
        // because we registered it in Program.cs
        public AuthController(DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        // --------------------------------------------------
        // POST /api/auth/register
        // --------------------------------------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Role))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            if (request.Role != "student" && request.Role != "staff")
            {
                return BadRequest(new { message = "Role must be 'student' or 'staff'." });
            }

            using var connection = _connectionFactory.CreateConnection();

            // Check if email already exists
            var existingUser = await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM users WHERE email = @Email",
                new { request.Email }
            );

            if (existingUser != null)
            {
                return Conflict(new { message = "An account with this email already exists." });
            }

            // Hash the password using SHA-256
           // var passwordHash = HashPassword(request.Password);

            // Insert new user
            var sql = @"INSERT INTO users (name, email, password_hash, role) 
                        VALUES (@Name, @Email, MD5(@PasswordHash), @Role)";

            await connection.ExecuteAsync(sql, new
            {
                request.Name,
                request.Email,
                PasswordHash = request.Password,
                request.Role
            });

            return Ok(new { message = "Registration successful. Please log in." });
        }

        // --------------------------------------------------
        // POST /api/auth/login
        // --------------------------------------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            using var connection = _connectionFactory.CreateConnection();

            // Find user by email
            var user = await connection.QueryFirstOrDefaultAsync<User>(
                Sql,
                new { request.Email, pass = request.Password}
            );

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

             
            // Return user info (never return password hash!)
            return Ok(new
            {
                message = "Login successful.",
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role
                }
            });
        }

        // --------------------------------------------------
        // SHA-256 password hashing helper
        // Converts a plain password string into a hex hash
        // --------------------------------------------------
        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes).ToLower();
        }
    }

    // --------------------------------------------------
    // Request models (what the API expects to receive)
    // These are separate from the DB models on purpose —
    // we never expose the full User model to the outside world
    // --------------------------------------------------
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}