import { createContext, useContext, useState } from "react";

const ProfilesContext = createContext(null); // null  = deafualt

const rootBoardItems = [
  [
    { id: 1, label: "אני", spokenText: "אני", cardType: "content", targetBoardId: null, slotIndex: 0 },
    { id: 2, label: "רוצה", spokenText: "רוצה", cardType: "content", targetBoardId: null, slotIndex: 1 },
    { id: 3, label: "לא", spokenText: "לא", cardType: "content", targetBoardId: null, slotIndex: 2 },
    { id: 4, label: "כן", spokenText: "כן", cardType: "content", targetBoardId: null, slotIndex: 3 },
    {
      id: 5,
      label: "אוכל",
      spokenText: "אוכל",
      cardType: "navigation",
      targetBoardId: 2,
      slotIndex: 4,
    },
    { id: 6, label: "מים", spokenText: "מים", cardType: "content", targetBoardId: null, slotIndex: 5 },
    { id: 7, label: "ללכת", spokenText: "ללכת", cardType: "content", targetBoardId: null, slotIndex: 6 },
    { id: 8, label: "עזרה", spokenText: "עזרה", cardType: "content", targetBoardId: null, slotIndex: 7 },
  ],
  [
    { id: 9, label: "בית", spokenText: "בית", cardType: "content", targetBoardId: null, slotIndex: 8 },
    { id: 10, label: "משפחה", spokenText: "משפחה", cardType: "content", targetBoardId: null, slotIndex: 9 },
    { id: 11, label: "חבר", spokenText: "חבר", cardType: "content", targetBoardId: null, slotIndex: 10 },
    { id: 12, label: "שמח", spokenText: "שמח", cardType: "content", targetBoardId: null, slotIndex: 11 },
    { id: 13, label: "עצוב", spokenText: "עצוב", cardType: "content", targetBoardId: null, slotIndex: 12 },
    { id: 14, label: "כואב", spokenText: "כואב", cardType: "content", targetBoardId: null, slotIndex: 13 },
    { id: 15, label: "עייף", spokenText: "עייף", cardType: "content", targetBoardId: null, slotIndex: 14 },
    { id: 16, label: "עוד", spokenText: "עוד", cardType: "content", targetBoardId: null, slotIndex: 15 },
  ],
  [
    { id: 17, label: "שלום", spokenText: "שלום", cardType: "content", targetBoardId: null, slotIndex: 16 },
    { id: 18, label: "תודה", spokenText: "תודה", cardType: "content", targetBoardId: null, slotIndex: 17 },
    { id: 19, label: "בבקשה", spokenText: "בבקשה", cardType: "content", targetBoardId: null, slotIndex: 18 },
    { id: 20, label: "עכשיו", spokenText: "עכשיו", cardType: "content", targetBoardId: null, slotIndex: 19 },
    { id: 21, label: "אחר כך", spokenText: "אחר כך", cardType: "content", targetBoardId: null, slotIndex: 20 },
    { id: 22, label: "איפה", spokenText: "איפה", cardType: "content", targetBoardId: null, slotIndex: 21 },
    { id: 23, label: "מה", spokenText: "מה", cardType: "content", targetBoardId: null, slotIndex: 22 },
    { id: 24, label: "מי", spokenText: "מי", cardType: "content", targetBoardId: null, slotIndex: 23 },
  ],
];

const foodBoardItems = [
  [
    { id: 25, label: "לחם", spokenText: "לחם", cardType: "content", targetBoardId: null, slotIndex: 0 },
    { id: 26, label: "גבינה", spokenText: "גבינה", cardType: "content", targetBoardId: null, slotIndex: 1 },
    { id: 27, label: "ביצה", spokenText: "ביצה", cardType: "content", targetBoardId: null, slotIndex: 2 },
    { id: 28, label: "יוגורט", spokenText: "יוגורט", cardType: "content", targetBoardId: null, slotIndex: 3 },
    { id: 29, label: "קורנפלקס", spokenText: "קורנפלקס", cardType: "content", targetBoardId: null, slotIndex: 4 },
    { id: 30, label: "כריך", spokenText: "כריך", cardType: "content", targetBoardId: null, slotIndex: 5 },
    { id: 31, label: "פסטה", spokenText: "פסטה", cardType: "content", targetBoardId: null, slotIndex: 6 },
    { id: 32, label: "אורז", spokenText: "אורז", cardType: "content", targetBoardId: null, slotIndex: 7 },
  ],
  [
    { id: 33, label: "עוף", spokenText: "עוף", cardType: "content", targetBoardId: null, slotIndex: 8 },
    { id: 34, label: "דג", spokenText: "דג", cardType: "content", targetBoardId: null, slotIndex: 9 },
    { id: 35, label: "מרק", spokenText: "מרק", cardType: "content", targetBoardId: null, slotIndex: 10 },
    { id: 36, label: "סלט", spokenText: "סלט", cardType: "content", targetBoardId: null, slotIndex: 11 },
    { id: 37, label: "תפוח", spokenText: "תפוח", cardType: "content", targetBoardId: null, slotIndex: 12 },
    { id: 38, label: "בננה", spokenText: "בננה", cardType: "content", targetBoardId: null, slotIndex: 13 },
    { id: 39, label: "עוגה", spokenText: "עוגה", cardType: "content", targetBoardId: null, slotIndex: 14 },
    { id: 40, label: "גלידה", spokenText: "גלידה", cardType: "content", targetBoardId: null, slotIndex: 15 },
  ],
  [
    { id: 41, label: "מים", spokenText: "מים", cardType: "content", targetBoardId: null, slotIndex: 16 },
    { id: 42, label: "חלב", spokenText: "חלב", cardType: "content", targetBoardId: null, slotIndex: 17 },
    { id: 43, label: "מיץ", spokenText: "מיץ", cardType: "content", targetBoardId: null, slotIndex: 18 },
    { id: 44, label: "תה", spokenText: "תה", cardType: "content", targetBoardId: null, slotIndex: 19 },
    { id: 45, label: "קפה", spokenText: "קפה", cardType: "content", targetBoardId: null, slotIndex: 20 },
    { id: 46, label: "חם", spokenText: "חם", cardType: "content", targetBoardId: null, slotIndex: 21 },
    { id: 47, label: "קר", spokenText: "קר", cardType: "content", targetBoardId: null, slotIndex: 22 },
    { id: 48, label: "עוד", spokenText: "עוד", cardType: "content", targetBoardId: null, slotIndex: 23 },
  ],
];

function createBoardCards(boardItems, boardId, navigationTargetBoardId = null) {
  // יוצרת עותק חדש של הכרטיסים עבור לוח מסוים
  return boardItems.map((row) =>
    row.map((card) => ({
      ...card,
      id: `${boardId}-card-${card.slotIndex}`,
      boardId, // מחבר את הכרטיס ללוח
      targetBoardId:
        card.cardType === "navigation"
          ? navigationTargetBoardId
          : null,
    }))
  );
}

function createDefaultBoards(profileId) {
  const rootBoardId = `${profileId}-root`;
  const foodBoardId = `${profileId}-food`;

  return [
    {
      id: rootBoardId,
      profileId,
      parentBoardId: null,
      name: "ראשי",
      isRoot: true,
      cards: createBoardCards(
        rootBoardItems,
        rootBoardId,
        foodBoardId
      ),
    },
    {
      id: foodBoardId,
      profileId,
      parentBoardId: rootBoardId,
      name: "אוכל ושתייה",
      isRoot: false,
      cards: createBoardCards(
        foodBoardItems,
        foodBoardId
      ),
    },
  ];
}

const initialProfiles = [
  {
    id: 1,
    name: "פרופיל ראשון",
    imagePath: null,
    createdAt: "2026-08-13",
  },
  {
    id: 2,
    name: "פרופיל שני",
    imagePath: null,
    createdAt: "2026-08-13",
  },
];

const initialBoards = initialProfiles.flatMap((profile) =>
  createDefaultBoards(profile.id)
);

export function ProfilesProvider({ children }) {

  const [profiles, setProfiles] = useState(initialProfiles);
  const [boards, setBoards] = useState(initialBoards);
  const [isEditorMode, setIsEditorMode] = useState(false);

  const toggleEditorMode = () => {
    setIsEditorMode((currentMode) => !currentMode);
  };

  const addProfile = (newProfile) => {
    setProfiles((currentProfiles) => [
      ...currentProfiles, newProfile]);

    setBoards((currentBoards) => [
      ...currentBoards,
      ...createDefaultBoards(newProfile.id)]);
  };

  const deleteProfile = (profileId) => {
    setProfiles((currentProfiles) =>
      currentProfiles.filter(
        (profile) => profile.id !== profileId
      )
    );

    setBoards((currentBoards) =>
      currentBoards.filter(
        (board) =>
          board.profileId.toString() !== profileId.toString()
      )
    );
  };

  const updateCard = (boardId, cardId, cardChanges) => {
    setBoards((currentBoards) =>
      currentBoards.map((board) => {
        if (board.id.toString() !== boardId.toString()) {
          return board;
        }

        return {
          ...board,
          cards: board.cards.map((row) =>
            row.map((card) =>
              card.id.toString() === cardId.toString()
                ? { ...card, ...cardChanges }
                : card
            )
          ),
        };
      })
    );
  };

  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        boards,
        isEditorMode,
        addProfile,
        deleteProfile,
        updateCard,
        toggleEditorMode,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}

export function useProfiles() { // מאפשר לכל מסך עטוף לקבל בקלות את הנתונים המשותפים
  return useContext(ProfilesContext);
}
