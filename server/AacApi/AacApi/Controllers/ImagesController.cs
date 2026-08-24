using Microsoft.AspNetCore.Mvc;

namespace AacApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public ImagesController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile image)
        {
            if (image.Length == 0)
            {
                return BadRequest("לא התקבלה תמונה.");
            }

            var extension =
                Path.GetExtension(image.FileName)
                    .ToLowerInvariant();

            var allowedExtensions =
                new[] { ".jpg", ".jpeg", ".png", ".webp" };

            if (
                !allowedExtensions.Contains(extension)
                || !image.ContentType.StartsWith("image/")
            )
            {
                return BadRequest("סוג התמונה אינו נתמך.");
            }

            var fileName =
                $"{Guid.NewGuid():N}{extension}";

            var uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "wwwroot",
                "uploads"
            );

            Directory.CreateDirectory(uploadsFolder);

            var filePath =
                Path.Combine(uploadsFolder, fileName);

            await using var stream =
                System.IO.File.Create(filePath);

            await image.CopyToAsync(stream);

            return Ok(
                new
                {
                    imagePath = $"/uploads/{fileName}"
                }
            );
        }
    }
}
