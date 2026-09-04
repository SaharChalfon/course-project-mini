USE master;
GO

IF DB_ID(N'AACCommunicationDb') IS NULL
BEGIN
    CREATE DATABASE AACCommunicationDb;
END;
GO

USE AACCommunicationDb;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO


CREATE TABLE dbo.Profiles
(
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    ImagePath NVARCHAR(1000) NULL,
    PredictionEnabled BIT NOT NULL
        CONSTRAINT DF_Profiles_PredictionEnabled DEFAULT 0,
    CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_Profiles_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Profiles PRIMARY KEY (Id),
    CONSTRAINT CK_Profiles_Name_NotBlank
        CHECK (LEN(LTRIM(RTRIM(Name))) > 0)
);
GO


CREATE TABLE dbo.Boards
(
    Id INT IDENTITY(1,1) NOT NULL,
    ProfileId INT NOT NULL,
    ParentBoardId INT NULL,
    Name NVARCHAR(100) NOT NULL,
    IsRoot BIT NOT NULL
        CONSTRAINT DF_Boards_IsRoot DEFAULT 0,
    CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_Boards_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_Boards PRIMARY KEY (Id),

    CONSTRAINT FK_Boards_Profiles
        FOREIGN KEY (ProfileId)
        REFERENCES dbo.Profiles(Id),

    CONSTRAINT FK_Boards_ParentBoard
        FOREIGN KEY (ParentBoardId)
        REFERENCES dbo.Boards(Id),

    CONSTRAINT CK_Boards_Name_NotBlank
        CHECK (LEN(LTRIM(RTRIM(Name))) > 0),

    CONSTRAINT CK_Boards_RootAndParent
        CHECK
        (
            (IsRoot = 1 AND ParentBoardId IS NULL)
            OR
            (IsRoot = 0 AND ParentBoardId IS NOT NULL)
        )
);
GO


CREATE TABLE dbo.CommunicationCards
(
    Id INT IDENTITY(1,1) NOT NULL,
    BoardId INT NOT NULL,
    CardType NVARCHAR(20) NOT NULL
        CONSTRAINT DF_CommunicationCards_CardType DEFAULT N'content',
    TargetBoardId INT NULL,
    Label NVARCHAR(100) NOT NULL
        CONSTRAINT DF_CommunicationCards_Label DEFAULT N'',
    SpokenText NVARCHAR(200) NOT NULL
        CONSTRAINT DF_CommunicationCards_SpokenText DEFAULT N'',
    ImagePath NVARCHAR(1000) NULL,
    SlotIndex TINYINT NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_CommunicationCards_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_CommunicationCards_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_CommunicationCards PRIMARY KEY (Id),

    CONSTRAINT FK_CommunicationCards_Boards
        FOREIGN KEY (BoardId)
        REFERENCES dbo.Boards(Id),

    CONSTRAINT FK_CommunicationCards_TargetBoard
        FOREIGN KEY (TargetBoardId)
        REFERENCES dbo.Boards(Id),

    CONSTRAINT CK_CommunicationCards_CardType
        CHECK (CardType IN (N'content', N'navigation')),

    CONSTRAINT CK_CommunicationCards_SlotIndex
        CHECK (SlotIndex BETWEEN 0 AND 23),

    CONSTRAINT CK_CommunicationCards_NavigationTarget
        CHECK
        (
            CardType <> N'navigation'
            OR TargetBoardId IS NOT NULL
        )
);
GO


CREATE TABLE dbo.SpokenSentences
(
    Id INT IDENTITY(1,1) NOT NULL,
    ProfileId INT NOT NULL,
    DisplayText NVARCHAR(2000) NOT NULL,
    SpokenText NVARCHAR(2000) NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL
        CONSTRAINT DF_SpokenSentences_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_SpokenSentences PRIMARY KEY (Id),

    CONSTRAINT FK_SpokenSentences_Profiles
        FOREIGN KEY (ProfileId)
        REFERENCES dbo.Profiles(Id),

    CONSTRAINT CK_SpokenSentences_DisplayText_NotBlank
        CHECK (LEN(LTRIM(RTRIM(DisplayText))) > 0),

    CONSTRAINT CK_SpokenSentences_SpokenText_NotBlank
        CHECK (LEN(LTRIM(RTRIM(SpokenText))) > 0)
);
GO




CREATE UNIQUE INDEX UX_Boards_OneRootPerProfile
    ON dbo.Boards(ProfileId)
    WHERE IsRoot = 1;
GO

CREATE UNIQUE INDEX UX_CommunicationCards_BoardAndSlot
    ON dbo.CommunicationCards(BoardId, SlotIndex);
GO

CREATE UNIQUE INDEX UX_CommunicationCards_TargetBoard
    ON dbo.CommunicationCards(TargetBoardId)
    WHERE TargetBoardId IS NOT NULL;
GO

CREATE INDEX IX_SpokenSentences_ProfileAndCreatedAt
    ON dbo.SpokenSentences(ProfileId, CreatedAt DESC);
GO
