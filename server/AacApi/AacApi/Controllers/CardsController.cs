using System.Data;
using AacApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace AacApi.Controllers
{
    [Route("api/boards/{boardId:int}/cards")]
    [ApiController]
    public class CardsController : ControllerBase
    {
        private readonly string _connectionString;

        public CardsController(
            IConfiguration configuration
        )
        {
            _connectionString =
                configuration.GetConnectionString(
                    "DefaultConnection"
                )
                ?? throw new InvalidOperationException(
                    "DefaultConnection was not found."
                );
        }


        [HttpPut("{cardId:int}")]
        public async Task<ActionResult<CommunicationCard>> UpdateCard(
    int boardId,
    int cardId,
    [FromBody] UpdateCardRequest request
)
        {
            var cleanLabel =
                request.Label?.Trim() ?? "";

            var cleanSpokenText =
                request.SpokenText?.Trim() ?? "";

            var cleanCardType =
                request.CardType?
                    .Trim()
                    .ToLowerInvariant()
                ?? "";

            var imagePath =
                request.ImagePath?.Trim();

            if (string.IsNullOrWhiteSpace(imagePath))
            {
                imagePath = null;
            }

            if (
                cleanLabel == ""
                || cleanSpokenText == ""
            )
            {
                return BadRequest(
                    "חובה למלא את שני שדות הטקסט."
                );
            }

            if (
                cleanCardType != "content"
                && cleanCardType != "navigation"
            )
            {
                return BadRequest(
                    "סוג הכרטיס אינו תקין."
                );
            }

            if (cleanLabel.Length > 100)
            {
                return BadRequest(
                    "הטקסט המוצג יכול להכיל עד 100 תווים."
                );
            }

            if (cleanSpokenText.Length > 200)
            {
                return BadRequest(
                    "הטקסט להקראה יכול להכיל עד 200 תווים."
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

            using var transaction =
                connection.BeginTransaction();

            try
            {
                int profileId;
                bool boardIsRoot;
                int? targetBoardId;
                int slotIndex;

                const string selectCardSql = @"
                    SELECT
                        Boards.ProfileId,
                        Boards.IsRoot,
                        Cards.TargetBoardId,
                        Cards.SlotIndex
                    FROM dbo.CommunicationCards AS Cards

                    INNER JOIN dbo.Boards AS Boards
                        ON Boards.Id = Cards.BoardId

                    WHERE Cards.Id = @CardId
                        AND Cards.BoardId = @BoardId;
                ";

                await using (
                    var selectCardCommand =
                        new SqlCommand(
                            selectCardSql,
                            connection,
                            transaction
                        )
                )
                {
                    selectCardCommand.Parameters
                        .Add(
                            "@CardId",
                            SqlDbType.Int
                        )
                        .Value = cardId;

                    selectCardCommand.Parameters
                        .Add(
                            "@BoardId",
                            SqlDbType.Int
                        )
                        .Value = boardId;

                    await using var reader =
                        await selectCardCommand
                            .ExecuteReaderAsync();

                    if (!await reader.ReadAsync())
                    {
                        await transaction.RollbackAsync();

                        return NotFound(
                            "הכרטיס או הלוח לא נמצאו."
                        );
                    }

                    profileId = reader.GetInt32(0);
                    boardIsRoot = reader.GetBoolean(1);

                    targetBoardId = reader.IsDBNull(2)
                        ? null
                        : reader.GetInt32(2);

                    slotIndex = Convert.ToInt32(reader.GetByte(3));
                }

                if (
                    cleanCardType == "navigation"
                    && !boardIsRoot
                )
                {
                    await transaction.RollbackAsync();

                    return BadRequest(
                        "בלוח־בן אפשר לשמור כרטיסי תוכן בלבד."
                    );
                }

                if (cleanCardType == "navigation")
                {
                    if (targetBoardId == null)
                    {
                        targetBoardId =
                            await CreateChildBoardAsync(
                                connection,
                                transaction,
                                profileId,
                                boardId,
                                cleanLabel
                            );
                    }
                    else
                    {
                        const string updateBoardSql = @"
                            UPDATE dbo.Boards

                            SET Name = @Name

                            WHERE Id = @TargetBoardId
                                AND ProfileId = @ProfileId
                                AND ParentBoardId = @ParentBoardId
                                AND IsRoot = 0;

                            SELECT @@ROWCOUNT;
                        ";

                        await using var updateBoardCommand =
                            new SqlCommand(
                                updateBoardSql,
                                connection,
                                transaction
                            );

                        updateBoardCommand.Parameters
                            .Add(
                                "@Name",
                                SqlDbType.NVarChar,
                                100
                            )
                            .Value = cleanLabel;

                        updateBoardCommand.Parameters
                            .Add(
                                "@TargetBoardId",
                                SqlDbType.Int
                            )
                            .Value = targetBoardId.Value;

                        updateBoardCommand.Parameters
                            .Add(
                                "@ProfileId",
                                SqlDbType.Int
                            )
                            .Value = profileId;

                        updateBoardCommand.Parameters
                            .Add(
                                "@ParentBoardId",
                                SqlDbType.Int
                            )
                            .Value = boardId;

                        var updatedBoardCount =
                            Convert.ToInt32(
                                await updateBoardCommand
                                    .ExecuteScalarAsync()
                            );

                        if (updatedBoardCount == 0)
                        {
                            throw new InvalidOperationException(
                                "The target board was not found."
                            );
                        }
                    }
                }

                const string updateCardSql = @"
                    UPDATE dbo.CommunicationCards

                    SET
                        Label = @Label,
                        SpokenText = @SpokenText,
                        ImagePath = @ImagePath,
                        CardType = @CardType,
                        TargetBoardId = @TargetBoardId,
                        UpdatedAt = SYSUTCDATETIME()

                    WHERE Id = @CardId
                        AND BoardId = @BoardId;
                ";

                await using var updateCardCommand =
                    new SqlCommand(
                        updateCardSql,
                        connection,
                        transaction
                    );

                updateCardCommand.Parameters
                    .Add(
                        "@Label",
                        SqlDbType.NVarChar,
                        100
                    )
                    .Value = cleanLabel;

                updateCardCommand.Parameters
                    .Add(
                        "@SpokenText",
                        SqlDbType.NVarChar,
                        200
                    )
                    .Value = cleanSpokenText;

                updateCardCommand.Parameters
                    .Add(
                        "@ImagePath",
                        SqlDbType.NVarChar,
                        1000
                    )
                    .Value =
                        (object?)imagePath
                        ?? DBNull.Value;

                updateCardCommand.Parameters
                    .Add(
                        "@CardType",
                        SqlDbType.NVarChar,
                        20
                    )
                    .Value = cleanCardType;

                updateCardCommand.Parameters
                    .Add(
                        "@TargetBoardId",
                        SqlDbType.Int
                    )
                    .Value =
                        (object?)targetBoardId
                        ?? DBNull.Value;

                updateCardCommand.Parameters
                    .Add(
                        "@CardId",
                        SqlDbType.Int
                    )
                    .Value = cardId;

                updateCardCommand.Parameters
                    .Add(
                        "@BoardId",
                        SqlDbType.Int
                    )
                    .Value = boardId;

                var updatedCardCount =
                    await updateCardCommand
                        .ExecuteNonQueryAsync();

                if (updatedCardCount != 1)
                {
                    throw new InvalidOperationException(
                        "The card was not updated."
                    );
                }

                await transaction.CommitAsync();

                return Ok(
                    new CommunicationCard
                    {
                        Id = cardId,
                        BoardId = boardId,
                        CardType = cleanCardType,
                        TargetBoardId = targetBoardId,
                        Label = cleanLabel,
                        SpokenText = cleanSpokenText,
                        ImagePath = imagePath,
                        SlotIndex = slotIndex
                    }
                );
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        [HttpDelete("{cardId:int}")]
        public async Task<IActionResult> DeleteCard(
    int boardId,
    int cardId
)
        {
            await using var connection =
                new SqlConnection(_connectionString);

            await connection.OpenAsync();

            using var transaction =
                connection.BeginTransaction();

            try
            {
                int? targetBoardId;

                const string selectCardSql = @"
                    SELECT TargetBoardId

                    FROM dbo.CommunicationCards

                    WHERE Id = @CardId
                        AND BoardId = @BoardId;
                ";

                await using (
                    var selectCardCommand =
                        new SqlCommand(
                            selectCardSql,
                            connection,
                            transaction
                        )
                )
                {
                    selectCardCommand.Parameters
                        .Add(
                            "@CardId",
                            SqlDbType.Int
                        )
                        .Value = cardId;

                    selectCardCommand.Parameters
                        .Add(
                            "@BoardId",
                            SqlDbType.Int
                        )
                        .Value = boardId;

                    await using var reader =
                        await selectCardCommand
                            .ExecuteReaderAsync();

                    if (!await reader.ReadAsync())
                    {
                        await transaction.RollbackAsync();

                        return NotFound(
                            "הכרטיס או הלוח לא נמצאו."
                        );
                    }

                    targetBoardId = reader.IsDBNull(0)
                        ? null
                        : reader.GetInt32(0);
                }

                const string resetCardSql = @"
                    UPDATE dbo.CommunicationCards

                    SET
                        CardType = N'content',
                        TargetBoardId = NULL,
                        Label = N'',
                        SpokenText = N'',
                        ImagePath = NULL,
                        UpdatedAt = SYSUTCDATETIME()

                    WHERE Id = @CardId
                        AND BoardId = @BoardId;
                ";

                await using (
                    var resetCardCommand =
                        new SqlCommand(
                            resetCardSql,
                            connection,
                            transaction
                        )
                )
                {
                    resetCardCommand.Parameters
                        .Add(
                            "@CardId",
                            SqlDbType.Int
                        )
                        .Value = cardId;

                    resetCardCommand.Parameters
                        .Add(
                            "@BoardId",
                            SqlDbType.Int
                        )
                        .Value = boardId;

                    var resetCardCount =
                        await resetCardCommand
                            .ExecuteNonQueryAsync();

                    if (resetCardCount != 1)
                    {
                        throw new InvalidOperationException(
                            "The card was not reset."
                        );
                    }
                }

                if (targetBoardId != null)
                {
                    const string deleteChildBoardSql = @"
                        DELETE FROM dbo.CommunicationCards
                        WHERE BoardId = @TargetBoardId;

                        DELETE FROM dbo.Boards
                        WHERE Id = @TargetBoardId
                            AND ParentBoardId = @ParentBoardId
                            AND IsRoot = 0;

                        SELECT @@ROWCOUNT;
                    ";

                    await using var deleteChildBoardCommand =
                        new SqlCommand(
                            deleteChildBoardSql,
                            connection,
                            transaction
                        );

                    deleteChildBoardCommand.Parameters
                        .Add(
                            "@TargetBoardId",
                            SqlDbType.Int
                        )
                        .Value = targetBoardId.Value;

                    deleteChildBoardCommand.Parameters
                        .Add(
                            "@ParentBoardId",
                            SqlDbType.Int
                        )
                        .Value = boardId;

                    var deletedBoardCount =
                        Convert.ToInt32(
                            await deleteChildBoardCommand
                                .ExecuteScalarAsync()
                        );

                    if (deletedBoardCount != 1)
                    {
                        throw new InvalidOperationException(
                            "The child board was not deleted."
                        );
                    }
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

        private static async Task<int> CreateChildBoardAsync(
    SqlConnection connection,
    SqlTransaction transaction,
    int profileId,
    int parentBoardId,
    string boardName
)
        {
            const string sql = @"
                SET NOCOUNT ON;

                DECLARE @ChildBoardId INT;
                DECLARE @CreatedAt DATETIME2(0) =
                    SYSUTCDATETIME();

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
                    @ParentBoardId,
                    @Name,
                    0,
                    @CreatedAt
                );

                SET @ChildBoardId =
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
                    @ChildBoardId,
                    N'content',
                    NULL,
                    N'',
                    N'',
                    NULL,
                    SlotIndex,
                    @CreatedAt,
                    @CreatedAt
                FROM Slots;

                SELECT @ChildBoardId;
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

            command.Parameters
                .Add(
                    "@ParentBoardId",
                    SqlDbType.Int
                )
                .Value = parentBoardId;

            command.Parameters
                .Add(
                    "@Name",
                    SqlDbType.NVarChar,
                    100
                )
                .Value = boardName;

            return Convert.ToInt32(
                await command.ExecuteScalarAsync()
            );
        }

    }
}
