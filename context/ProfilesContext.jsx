import { createContext, useContext, useState } from "react";

const ProfilesContext = createContext(null); // null  = deafualt

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

export function ProfilesProvider({ children }) { // יוצר קומפוננטה שעוטפת מסכים
  const [profiles, setProfiles] = useState(initialProfiles); 
  return (
    <ProfilesContext.Provider value={{ profiles, setProfiles }}> 
      {children}
    </ProfilesContext.Provider> // משתף את הרשימה ואת פונקציית העדכון עם כל הצאצאים
  );
}

export function useProfiles() { // מאפשר לכל מסך עטוף לקבל בקלות את הנתונים המשותפים
  return useContext(ProfilesContext);
}