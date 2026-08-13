import { Link } from "expo-router";
import { styled } from 'nativewind';
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useProfiles } from "../context/ProfilesContext";

const SafeAreaView = styled(RNSafeAreaView);


export default function Index() {
  const { profiles, setProfiles } = useProfiles();

  const [isEditorMode, setIsEditorMode] = useState(false);

  const handleDelete = (profileId) => { // פונקציה שמטפלת במחיקת פרופיל 
    Alert.alert(
      "מחיקת פרופיל",
      "האם אתה בטוח שברצונך למחוק את הפרופיל?",
      [
        { text: "ביטול", style: "cancel" },
        {
          text: "מחק", style: "destructive",
          onPress: () => {
            setProfiles((currentProfiles) => currentProfiles.filter(
              (profile) => profile.id !== profileId // מפלטרים מרשימת הפרופילים את השם ה id שנשלח
            )
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-5">
      <Link href="/About" asChild>
        <Pressable
          className="
            absolute bottom-6 right-6
            min-w-32 items-center
            rounded-xl bg-blue-500
            px-6 py-3
            shadow-md
            bg-slate-800 active:bg-slate-950
          "
        >
          <Text className="text-base font-bold text-white">אודות</Text>
        </Pressable>
      </Link>

      <View className="w-full items-center gap-3">
        {profiles.map((profile) => (
          <View
            key={profile.id}
            className="flex-row-reverse items-center gap-3"
          >
            <Link
              href={{
                pathname: "/profiles/Profile",
                params: {
                  profileId: profile.id.toString(),
                },
              }}
              asChild
            >
              <Pressable
                className="
                h-12 w-80
                items-center justify-center
                rounded-xl bg-indigo-600
                px-4 shadow-md    
                active:bg-indigo-700"
              >
                <Text className="text-base font-bold text-white">
                  {profile.name}
                </Text>
              </Pressable>
            </Link>

            {isEditorMode && ( // משמעות הדבר עם הביטוי הוא אמת אז תבצע את הבלוק שאחריי
              <Pressable
                onPress={() => handleDelete(profile.id)}
                className="
                items-center rounded-lg
                bg-red-600 px-4 py-3
                active:bg-red-700"
              >
                <Text className="font-bold text-white">
                  מחק
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {isEditorMode && ( // משמעות הדבר היא "אם isEditorMode == true אז להפעיל את הבלוק שבא אחריי &&"
        <Link href="/profiles/create" asChild>

          <Pressable
            className="
          absolute bottom-24 left-6
          min-w-32 items-center
          rounded-xl bg-green-600
          px-6 py-3
          shadow-md active:bg-green-700"
          >
            <Text className="text-base font-bold text-white">
              צור פרופיל חדש
            </Text>
          </Pressable>
        </Link>
      )}

      <Pressable
        onPress={() =>
          setIsEditorMode((previous) => !previous)} // ההפך מהמצב שהיה לפניכן, דלוק/כבוי
        className={`
          absolute bottom-6 left-6
          min-w-32 items-center
          rounded-xl px-6 py-3
          shadow-md

          ${isEditorMode ? "bg-green-600 active:bg-green-700" : "bg-slate-800 active:bg-slate-950"}`} // אם isEditorMode == true אז שמאל אם false אז ימין
      >
        <Text className="text-base font-bold text-white">
          מצב עורך
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}