import { createContext, useContext, useEffect, useState } from "react";

const ProfilesContext = createContext(null); // null  = deafualt
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function getImageUrl(imagePath) {
  return imagePath?.startsWith("/uploads/") ? `${API_URL}${imagePath}` : imagePath;
}

async function uploadImage(imageAsset) {
  const imageType =
    imageAsset.mimeType ?? "image/jpeg";

  const imageExtension =
    imageType === "image/jpeg"
      ? "jpg"
      : imageType.replace("image/", "");

  const formData = new FormData();

  formData.append("image", {
    uri: imageAsset.uri,
    name: `image.${imageExtension}`,
    type: imageType,
  });

  const response = await fetch(
    `${API_URL}/api/images`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image.");
  }

  const uploadedImage = await response.json();

  return uploadedImage.imagePath;
}

async function getSpokenSentences(profileId) {
  const response = await fetch(
    `${API_URL}/api/profiles/${profileId}/spoken-sentences`
  );

  if (!response.ok) {
    throw new Error("Failed to load spoken sentences.");
  }

  return response.json();
}


async function getProfilesAndBoards() {
  const profilesResponse = await fetch(
    `${API_URL}/api/profiles`
  );

  if (!profilesResponse.ok) {
    throw new Error("Failed to load profiles.");
  }

  const profiles = await profilesResponse.json();

  const boardsByProfile = await Promise.all(
    profiles.map(async (profile) => {
      const boardsResponse = await fetch(
        `${API_URL}/api/profiles/${profile.id}/boards`
      );

      if (!boardsResponse.ok) {
        throw new Error(
          `Failed to load boards for profile ${profile.id}.`
        );
      }

      return boardsResponse.json();
    })
  );

  const spokenSentencesByProfile = await Promise.all(
    profiles.map((profile) =>
      profile.predictionEnabled
        ? getSpokenSentences(profile.id)
        : Promise.resolve([])
    )
  );

  return {
    profiles,
    boards: boardsByProfile.flat(),
    spokenSentences: spokenSentencesByProfile.flat(),
  };
}

export function ProfilesProvider({ children }) {

  const [profiles, setProfiles] = useState([]);
  const [boards, setBoards] = useState([]);
  const [spokenSentences, setSpokenSentences] = useState([]);
  const [isEditorMode, setIsEditorMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getProfilesAndBoards();

        setProfiles(data.profiles);
        setBoards(data.boards);
        setSpokenSentences(data.spokenSentences);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const toggleEditorMode = () => {
    setIsEditorMode((currentMode) => !currentMode);
  };

  const addProfile = async (name, imageAsset) => {
    const imagePath = imageAsset
      ? await uploadImage(imageAsset)
      : null;

    const response = await fetch(
      `${API_URL}/api/profiles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, imagePath }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create profile.");
    }

    const data = await getProfilesAndBoards();

    setProfiles(data.profiles);
    setBoards(data.boards);
    setSpokenSentences(data.spokenSentences);
  };

  const updateProfile = async (
    profileId,
    profileChanges,
    imageAsset
  ) => {
    let imagePath = profileChanges.imagePath;

    if (imageAsset) {
      imagePath = await uploadImage(imageAsset);
    }

    const response = await fetch(
      `${API_URL}/api/profiles/${profileId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileChanges.name,
          imagePath,
          predictionEnabled:
            profileChanges.predictionEnabled,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update profile.");
    }

    const data = await getProfilesAndBoards();

    setProfiles(data.profiles);
    setBoards(data.boards);
    setSpokenSentences(data.spokenSentences);
  };

  const deleteProfile = async (profileId) => {
    const response = await fetch(
      `${API_URL}/api/profiles/${profileId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete profile.");
    }

    const data = await getProfilesAndBoards();

    setProfiles(data.profiles);
    setBoards(data.boards);
    setSpokenSentences(data.spokenSentences);
  };

  const updateCard = async (
    boardId,
    cardId,
    cardChanges,
    imageAsset
  ) => {
    let imagePath = cardChanges.imagePath;

    if (imageAsset) {
      imagePath = await uploadImage(imageAsset);
    }

    const response = await fetch(
      `${API_URL}/api/boards/${boardId}/cards/${cardId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: cardChanges.label,
          spokenText: cardChanges.spokenText,
          imagePath,
          cardType: cardChanges.cardType,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update card.");
    }

    const data = await getProfilesAndBoards();

    setProfiles(data.profiles);
    setBoards(data.boards);
    setSpokenSentences(data.spokenSentences);
  };

  const deleteCard = async (boardId, cardId) => {
    const response = await fetch(
      `${API_URL}/api/boards/${boardId}/cards/${cardId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete card.");
    }

    const data = await getProfilesAndBoards();

    setProfiles(data.profiles);
    setBoards(data.boards);
    setSpokenSentences(data.spokenSentences);
  };

  const saveSpokenSentence = async (
    profileId,
    displayText,
    spokenText
  ) => {
    const response = await fetch(
      `${API_URL}/api/profiles/${profileId}/spoken-sentences`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayText,
          spokenText,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save spoken sentence.");
    }

    const savedSentence = await response.json();

    setSpokenSentences((currentSentences) => [
      savedSentence,
      ...currentSentences,
    ]);

    return savedSentence;
  };

  const loadSpokenSentences = async (profileId) => {
    const loadedSentences = await getSpokenSentences(profileId);

    setSpokenSentences((currentSentences) => [
      ...loadedSentences,
      ...currentSentences.filter(
        (sentence) => sentence.profileId !== profileId
      ),
    ]);
  };


  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        boards,
        spokenSentences,
        isEditorMode,
        addProfile,
        updateProfile,
        deleteProfile,
        updateCard,
        deleteCard,
        saveSpokenSentence,
        loadSpokenSentences,
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
