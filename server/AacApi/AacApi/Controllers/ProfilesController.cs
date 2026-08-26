using System.Data;
using AacApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace AacApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfilesController : ControllerBase
    {
        private readonly string _connectionString;

        public ProfilesController(IConfiguration configuration) // IConfiguration קורא את DefaultConnection 
        {
            _connectionString =
                configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "DefaultConnection was not found."
                );
        }

        [HttpGet]
        public async Task<ActionResult<List<Profile>>> GetProfiles()
        {
            var profiles = new List<Profile>();

            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            const string sql = @"
                SELECT
                    Id,
                    Name,
                    ImagePath,
                    CreatedAt
                FROM dbo.Profiles
                ORDER BY Id;
            ";

            await using var command =
                new SqlCommand(sql, connection);

            await using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                profiles.Add(
                    new Profile
                    {
                        Id = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        ImagePath = reader.IsDBNull(2) ? null : reader.GetString(2),
                        CreatedAt = reader.GetDateTime(3)
                    }
                );
            }

            return Ok(profiles);
        }

        [HttpPost]
        public async Task<ActionResult<Profile>> CreateProfile(
        [FromBody] CreateProfileRequest request)
        {
            var cleanName = request.Name?.Trim() ?? "";
            var imagePath = request.ImagePath?.Trim();

            if (string.IsNullOrWhiteSpace(imagePath))
            {
                imagePath = null;
            }

            if (cleanName == "")
            {
                return BadRequest(
                    "חובה להזין שם לפרופיל."
                );
            }

            if (cleanName.Length > 100)
            {
                return BadRequest(
                    "שם פרופיל יכול להכיל עד 100 תווים."
                );
            }

            if (imagePath?.Length > 1000)
            {
                return BadRequest(
                    "נתיב התמונה ארוך מדי."
                );
            }

            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();


            /* 

            Transaction הוא קבוצה של פעולות SQL שמתבצעות כיחידה אחת: או שכולן מצליחות, או שאף אחת מהן לא נשמרת.
            לדוגמה, בעת יצירת פרופיל צריך:
            1. להוסיף רשומה ל־Profiles.
            2. ליצור עבורו לוח ראשי ב־Boards.
            3. ליצור 24 תאים ב־CommunicationCards.
            אם יצירת התא ה־15 נכשלת, לא נרצה להישאר עם פרופיל ולוח חלקי. לכן מבצעים את שלוש הפעולות בתוך transaction:
            - הצליח הכול → Commit שומר את הפעולות.
            - משהו נכשל → Rollback מבטל את כל הפעולות.  

            */

            using var transaction = connection.BeginTransaction();

            try
            {
                const string sql = @"
                    SET NOCOUNT ON;

                    DECLARE @ProfileId INT;
                    DECLARE @BoardId INT;
                    DECLARE @CreatedAt DATETIME2(0) =
                        SYSUTCDATETIME();

                    INSERT INTO dbo.Profiles
                    (
                        Name,
                        ImagePath,
                        CreatedAt
                    )
                    VALUES
                    (
                        @Name,
                        @ImagePath,
                        @CreatedAt
                    );

                    SET @ProfileId =
                        CONVERT(INT, SCOPE_IDENTITY());

                    INSERT INTO dbo.Boards
                    (
                        ProfileId,
                        ParentBoardId,
                        Name,
                        IsRoot,
                        CreatedAt
                    )
                    VALUES
                    (
                        @ProfileId,
                        NULL,
                        N'ראשי',
                        1,
                        @CreatedAt
                    );

                    SET @BoardId =
                        CONVERT(INT, SCOPE_IDENTITY());

                    ;WITH Slots AS
                    (
                        SELECT
                            CAST(0 AS TINYINT) AS SlotIndex

                        UNION ALL

                        SELECT
                            CAST(SlotIndex + 1 AS TINYINT)
                        FROM Slots
                        WHERE SlotIndex < 23
                    )
                    INSERT INTO dbo.CommunicationCards
                    (
                        BoardId,
                        CardType,
                        TargetBoardId,
                        Label,
                        SpokenText,
                        ImagePath,
                        SlotIndex,
                        CreatedAt,
                        UpdatedAt
                    )
                    SELECT
                        @BoardId,
                        N'content',
                        NULL,
                        N'',
                        N'',
                        NULL,
                        SlotIndex,
                        @CreatedAt,
                        @CreatedAt
                    FROM Slots;

                    SELECT
                        @ProfileId AS Id,
                        @Name AS Name,
                        @ImagePath AS ImagePath,
                        @CreatedAt AS CreatedAt;
                ";

                Profile createdProfile;

                await using (var command =
                    new SqlCommand(
                        sql,
                        connection,
                        transaction
                    ))
                {
                    command.Parameters
                        .Add(
                            "@Name",
                            SqlDbType.NVarChar,
                            100
                        )
                        .Value = cleanName;

                    command.Parameters
                        .Add(
                            "@ImagePath",
                            SqlDbType.NVarChar,
                            1000
                        )
                        .Value =
                            (object?)imagePath
                            ?? DBNull.Value;

                    await using var reader =
                        await command.ExecuteReaderAsync();

                    if (!await reader.ReadAsync())
                    {
                        throw new InvalidOperationException(
                            "The created profile was not returned."
                        );
                    }

                    createdProfile = new Profile
                    {
                        Id = reader.GetInt32(0),
                        Name = reader.GetString(1),
                        ImagePath = reader.IsDBNull(2)
                            ? null
                            : reader.GetString(2),
                        CreatedAt = reader.GetDateTime(3)
                    };
                }

                await transaction.CommitAsync();

                return StatusCode(
                    StatusCodes.Status201Created,
                    createdProfile
                );
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpGet("{profileId:int}/boards")]
        public async Task<ActionResult<List<Board>>> GetProfileBoards(
            int profileId
        )
        {
            var boards = new List<Board>();

            var boardsById =
                new Dictionary<int, Board>();

            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            const string sql = @"
                SELECT
                    Boards.Id,
                    Boards.ProfileId,
                    Boards.ParentBoardId,
                    Boards.Name,
                    Boards.IsRoot,

                    Cards.Id,
                    Cards.BoardId,
                    Cards.CardType,
                    Cards.TargetBoardId,
                    Cards.Label,
                    Cards.SpokenText,
                    Cards.ImagePath,
                    Cards.SlotIndex

                FROM dbo.Boards AS Boards

                LEFT JOIN dbo.CommunicationCards AS Cards
                    ON Cards.BoardId = Boards.Id

                WHERE Boards.ProfileId = @ProfileId

                ORDER BY
                    Boards.IsRoot DESC,
                    Boards.Id,
                    Cards.SlotIndex;
            ";

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters
                .Add(
                    "@ProfileId",
                    SqlDbType.Int
                )
                .Value = profileId;

            await using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var boardId = reader.GetInt32(0);

                if (!boardsById.TryGetValue(
                    boardId,
                    out var board
                ))
                {
                    board = new Board
                    {
                        Id = boardId,
                        ProfileId = reader.GetInt32(1),
                        ParentBoardId = reader.IsDBNull(2)
                            ? null
                            : reader.GetInt32(2),
                        Name = reader.GetString(3),
                        IsRoot = reader.GetBoolean(4)
                    };

                    boardsById.Add(
                        boardId,
                        board
                    );

                    boards.Add(board);
                }

                if (!reader.IsDBNull(5))
                {
                    var slotIndex =
                        Convert.ToInt32(
                            reader.GetByte(12)
                        );

                    var card =
                        new CommunicationCard
                        {
                            Id = reader.GetInt32(5),
                            BoardId = reader.GetInt32(6),
                            CardType = reader.GetString(7),
                            TargetBoardId =
                                reader.IsDBNull(8)
                                    ? null
                                    : reader.GetInt32(8),
                            Label = reader.GetString(9),
                            SpokenText =
                                reader.GetString(10),
                            ImagePath =
                                reader.IsDBNull(11)
                                    ? null
                                    : reader.GetString(11),
                            SlotIndex = slotIndex
                        };

                    var rowIndex =
                        slotIndex / 8;

                    board.Cards[rowIndex].Add(card);
                }
            }

            if (boards.Count == 0)
            {
                return NotFound(
                    "הפרופיל או הלוחות שלו לא נמצאו."
                );
            }

            return Ok(boards);
        }

        [HttpGet("{profileId:int}/spoken-sentences")]
        public async Task<ActionResult<List<SpokenSentence>>> GetSpokenSentences(
            int profileId
        )
        {
            var sentences = new List<SpokenSentence>();

            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            const string sql = @"
                SELECT
                    Id,
                    ProfileId,
                    DisplayText,
                    SpokenText,
                    CreatedAt
                FROM dbo.SpokenSentences
                WHERE ProfileId = @ProfileId
                ORDER BY CreatedAt DESC, Id DESC;
            ";

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters
                .Add(
                    "@ProfileId",
                    SqlDbType.Int
                )
                .Value = profileId;

            await using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                sentences.Add(
                    new SpokenSentence
                    {
                        Id = reader.GetInt32(0),
                        ProfileId = reader.GetInt32(1),
                        DisplayText = reader.GetString(2),
                        SpokenText = reader.GetString(3),
                        CreatedAt = DateTime.SpecifyKind(
                            reader.GetDateTime(4),
                            DateTimeKind.Utc
                        )
                    }
                );
            }

            return Ok(sentences);
        }

        [HttpPost("{profileId:int}/spoken-sentences")]
        public async Task<ActionResult<SpokenSentence>> CreateSpokenSentence(
            int profileId,
            [FromBody] CreateSpokenSentenceRequest request
        )
        {
            var cleanDisplayText =
                request.DisplayText?.Trim() ?? "";

            var cleanSpokenText =
                request.SpokenText?.Trim() ?? "";

            if (
                cleanDisplayText == ""
                || cleanSpokenText == ""
            )
            {
                return BadRequest(
                    "לא ניתן לשמור משפט ריק."
                );
            }

            if (
                cleanDisplayText.Length > 2000
                || cleanSpokenText.Length > 2000
            )
            {
                return BadRequest(
                    "המשפט יכול להכיל עד 2000 תווים."
                );
            }

            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            const string sql = @"
                INSERT INTO dbo.SpokenSentences
                (
                    ProfileId,
                    DisplayText,
                    SpokenText,
                    CreatedAt
                )
                OUTPUT
                    inserted.Id,
                    inserted.ProfileId,
                    inserted.DisplayText,
                    inserted.SpokenText,
                    inserted.CreatedAt
                SELECT
                    Profiles.Id,
                    @DisplayText,
                    @SpokenText,
                    SYSUTCDATETIME()
                FROM dbo.Profiles AS Profiles
                WHERE Profiles.Id = @ProfileId;
            ";

            await using var command =
                new SqlCommand(sql, connection);

            command.Parameters
                .Add(
                    "@ProfileId",
                    SqlDbType.Int
                )
                .Value = profileId;

            command.Parameters
                .Add(
                    "@DisplayText",
                    SqlDbType.NVarChar,
                    2000
                )
                .Value = cleanDisplayText;

            command.Parameters
                .Add(
                    "@SpokenText",
                    SqlDbType.NVarChar,
                    2000
                )
                .Value = cleanSpokenText;

            await using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return NotFound(
                    "הפרופיל לא נמצא."
                );
            }

            var createdSentence = new SpokenSentence
            {
                Id = reader.GetInt32(0),
                ProfileId = reader.GetInt32(1),
                DisplayText = reader.GetString(2),
                SpokenText = reader.GetString(3),
                CreatedAt = DateTime.SpecifyKind(
                    reader.GetDateTime(4),
                    DateTimeKind.Utc
                )
            };

            return StatusCode(
                StatusCodes.Status201Created,
                createdSentence
            );
        }

        [HttpDelete("{profileId:int}")]
        public async Task<IActionResult> DeleteProfile(int profileId)
        {
            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            using var transaction =
                connection.BeginTransaction();

            try
            {
                const string sql = @"
                    SET NOCOUNT ON;

                    DELETE Cards
                    FROM dbo.CommunicationCards AS Cards
                    INNER JOIN dbo.Boards AS Boards
                        ON Boards.Id = Cards.BoardId
                    WHERE Boards.ProfileId = @ProfileId;

                    DELETE FROM dbo.SpokenSentences
                    WHERE ProfileId = @ProfileId;

                    DELETE FROM dbo.Boards
                    WHERE ProfileId = @ProfileId
                        AND IsRoot = 0;

                    DELETE FROM dbo.Boards
                    WHERE ProfileId = @ProfileId
                        AND IsRoot = 1;

                    DELETE FROM dbo.Profiles
                    WHERE Id = @ProfileId;

                    SELECT @@ROWCOUNT;
                ";

                await using var command =
                    new SqlCommand(
                        sql,
                        connection,
                        transaction
                    );

                command.Parameters
                    .Add(
                        "@ProfileId",
                        SqlDbType.Int
                    )
                    .Value = profileId;

                var deletedProfileCount =
                    Convert.ToInt32(
                        await command.ExecuteScalarAsync()
                    );

                if (deletedProfileCount == 0)
                {
                    await transaction.RollbackAsync();

                    return NotFound(
                        "הפרופיל לא נמצא."
                    );
                }

                await transaction.CommitAsync();

                return NoContent();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }



    }
}
