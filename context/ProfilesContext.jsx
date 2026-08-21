import { createContext, useContext, useState } from "react";

const ProfilesContext = createContext(null); // null  = deafualt

function createEmptyBoardCards(boardId) {
  return Array.from({ length: 3 }, (_, rowIndex) =>
    Array.from({ length: 8 }, (_, columnIndex) => {
      const slotIndex = rowIndex * 8 + columnIndex;

      return {
        id: `${boardId}-card-${slotIndex}`,
        boardId,
        cardType: "content",
        label: "",
        spokenText: "",
        imagePath: null,
        targetBoardId: null,
        slotIndex,
      };
    })
  );
}

function createDefaultBoards(profileId) {
  const rootBoardId = `${profileId}-root`;

  return [
    {
      id: rootBoardId,
      profileId,
      parentBoardId: null,
      name: "ראשי",
      isRoot: true,
      cards: createEmptyBoardCards(rootBoardId),
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
    setBoards((currentBoards) => {
      const selectedBoard = currentBoards.find(
        (board) => board.id.toString() === boardId.toString()
      );

      const selectedCard = selectedBoard?.cards
        .flat()
        .find((card) => card.id.toString() === cardId.toString());

      if (!selectedBoard || !selectedCard) {
        return currentBoards;
      }

      let targetBoardId = selectedCard.targetBoardId;
      let updatedBoards = currentBoards;

      if (
        cardChanges.cardType === "navigation" &&
        targetBoardId === null
      ) {
        const childBoardId = `${selectedCard.id}-board`;

        targetBoardId = childBoardId;
        updatedBoards = [
          ...currentBoards,
          {
            id: childBoardId,
            profileId: selectedBoard.profileId,
            parentBoardId: selectedBoard.id,
            name: cardChanges.label,
            isRoot: false,
            cards: createEmptyBoardCards(childBoardId),
          },
        ];
      }

      if (
        cardChanges.cardType === "navigation" &&
        targetBoardId !== null
      ) {
        updatedBoards = updatedBoards.map((board) =>
          board.id.toString() === targetBoardId.toString()
            ? { ...board, name: cardChanges.label }
            : board
        );
      }

      return updatedBoards.map((board) => {
        if (board.id.toString() !== boardId.toString()) {
          return board;
        }

        return {
          ...board,
          cards: board.cards.map((row) =>
            row.map((card) =>
              card.id.toString() === cardId.toString()
                ? {
                  ...card,
                  ...cardChanges,
                  targetBoardId,
                }
                : card
            )
          ),
        };
      });
    });
  };

  const deleteCard = (boardId, cardId) => {
    setBoards((currentBoards) => {
      const selectedBoard = currentBoards.find(
        (board) => board.id.toString() === boardId.toString()
      );

      const selectedCard = selectedBoard?.cards
        .flat()
        .find((card) => card.id.toString() === cardId.toString());

      if (!selectedCard) {
        return currentBoards;
      }

      return currentBoards
        .filter(
          (board) =>
            selectedCard.targetBoardId === null ||
            board.id.toString() !== selectedCard.targetBoardId.toString()
        )
        .map((board) => {
          if (board.id.toString() !== boardId.toString()) {
            return board;
          }

          return {
            ...board,
            cards: board.cards.map((row) =>
              row.map((card) =>
                card.id.toString() === cardId.toString()
                  ? {
                    ...card,
                    label: "",
                    spokenText: "",
                    imagePath: null,
                    cardType: "content",
                    targetBoardId: null,
                  }
                  : card
              )
            ),
          };
        });
    });
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
        deleteCard,
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
