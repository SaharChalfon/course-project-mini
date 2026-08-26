import * as ImagePicker from "expo-image-picker";
import { Link, router } from 'expo-router';
import { useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import { useProfiles } from "../../context/ProfilesContext";
export default function CreateProfile() {

  const [name, setName] = useState(""); // state לשינוי השם
  const [selectedImage, setSelectedImage] = useState(null);
  const { addProfile } = useProfiles(); // useProfiles() נותן לקומפוננטה גישה לערכים שה־ProfilesProvider משתף

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch {
      Alert.alert("שגיאה", "לא ניתן היה לבחור תמונת פרופיל");
    }
  };

  const handleSave = async () => {
    const cleanName = name.trim();

    if (cleanName === "") {
      Alert.alert("שגיאה", "חובה להזין שם לפרופיל");
      return;
    }

    try {
      await addProfile(cleanName, selectedImage);
      router.replace("/"); // יעני תחזור לroot - מסך הבית
    } catch {
      Alert.alert("שגיאה", "לא ניתן היה ליצור את הפרופיל");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-6 text-2xl font-bold">
        יצירת פרופיל חדש
      </Text>

      <View className="mb-6 flex-row-reverse items-end gap-6">
        <View className="w-80 items-center">
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

        <View className="w-40 items-center gap-2">
          <Text className="text-base font-bold text-slate-800">
            תמונת פרופיל
          </Text>

          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.uri }}
              resizeMode="cover"
              className="h-20 w-20 rounded-full bg-slate-200"
            />
          ) : (
            <View className="h-20 w-20 items-center justify-center bg-slate-200">
              <Text className="text-center text-sm font-bold text-slate-600">
                ללא תמונה
              </Text>
            </View>
          )}

          <Pressable
            onPress={handlePickImage}
            className="w-full items-center rounded-xl bg-sky-200 px-4 py-2 active:bg-sky-300"
          >
            <Text className="font-bold text-sky-950">
              בחר תמונה
            </Text>
          </Pressable>

          {selectedImage && (
            <Pressable
              onPress={() => setSelectedImage(null)}
              className="w-full items-center rounded-xl bg-rose-200 px-4 py-2 active:bg-rose-300"
            >
              <Text className="font-bold text-rose-950">
                הסר בחירה
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View className="w-80 flex-row gap-3">
        <Pressable
          onPress={handleSave}
          style={{ flex: 2 }}
          className="
          items-center rounded-xl
          rounded-xl bg-emerald-200
          px-6 py-3
          shadow-sm active:bg-emerald-300"
        >
          <Text className="text-base font-bold text-emerald-950">
            שמור פרופיל
          </Text>
        </Pressable>

        <Link href="/" asChild>
          <Pressable className="rounded-xl bg-slate-200 px-6 py-3 active:bg-slate-300">
            <Text className="text-base font-bold text-slate-900">
              חזרה
            </Text>
          </Pressable>
        </Link>
      </View>

    </View>
  );
}
