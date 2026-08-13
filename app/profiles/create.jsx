import { Link, router } from 'expo-router';
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useProfiles } from "../../context/ProfilesContext";
export default function CreateProfile() {

  const [name, setName] = useState(""); // state לשינוי השם
  const { setProfiles } = useProfiles(); // useProfiles() נותן לקומפוננטה גישה לערכים שה־ProfilesProvider משתף

  const handleSave = () => {
    const cleanName = name.trim();

    if (cleanName === "") {
      Alert.alert("שגיאה", "חובה להזין שם לפרופיל");
      return;
    }
    const newProfile = {
      id: Date.now().toString(), // עושה חישוב על התאריך שנותן מספר ייחודי
      name: cleanName,
    };

    setProfiles((currentProfiles) => [
      ...currentProfiles, // פורס את המערך הקיים
      newProfile, // ומוסיף אחד נוסף
    ]);

    router.replace("/"); // יעני תחזור לroot - מסך הבית
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="mb-6 text-2xl font-bold">
        יצירת פרופיל חדש
      </Text>

      <View className="mb-6 w-full items-center ">
        <Text className="mb-2 text-right text-base font-bold">
          שם הפרופיל
        </Text>

        <TextInput
          value={name}
          onChangeText={(text) => setName(text)}
          placeholder="הכנס שם לפרופיל"
          textAlign="center"
          className="
          w-80 rounded-xl 
          border border-slate-300
          bg-white px-4 py-3
          text-base"/>
      </View>

      <View className="w-80 flex-row gap-3">
        <Pressable
          onPress={handleSave}
          style={{ flex: 2 }}
          className="
          items-center rounded-xl
          bg-green-600 px-6 py-3
          active:bg-green-700"
        >
          <Text className="text-base font-bold text-white">
            שמור פרופיל
          </Text>
        </Pressable>

        <Link href="/" asChild>
          <Pressable
            style={{ flex: 1 }}
            className="
            items-center rounded-xl
            bg-slate-800 px-6 py-3
            active:bg-slate-950"
          >
            <Text className="font-bold text-white">
              חזרה
            </Text>
          </Pressable>
        </Link>
      </View>

    </View>
  );
}

