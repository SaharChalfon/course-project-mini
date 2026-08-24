SELECT
    @@SERVERNAME AS ServerName,
    DB_NAME() AS DatabaseName;

SELECT N'Profiles' AS TableName, COUNT(*) AS ToatalRows
FROM dbo.Profiles

UNION ALL

SELECT N'Boards', COUNT(*)
FROM dbo.Boards

UNION ALL

SELECT N'CommunicationCards', COUNT(*)
FROM dbo.CommunicationCards

UNION ALL

SELECT N'SpokenSentences', COUNT(*)
FROM dbo.SpokenSentences;


SELECT
    Boards.Id AS BoardId,
    Boards.ProfileId,
    Boards.Name,
    COUNT(Cards.Id) AS CardCount,
    MIN(Cards.SlotIndex) AS FirstSlot,
    MAX(Cards.SlotIndex) AS LastSlot
FROM dbo.Boards AS Boards
LEFT JOIN dbo.CommunicationCards AS Cards
    ON Cards.BoardId = Boards.Id
GROUP BY
    Boards.Id,
    Boards.ProfileId,
    Boards.Name;
