import * as ImagePicker from "expo-image-picker";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Switch, Text, TextInput, View } from "react-native";
import { getImageUrl, useProfiles } from "../../context/ProfilesContext";

export default function ProfileSettings() {
  const { profileId } = useLocalSearchParams();
  const normalizedProfileId = Array.isArray(profileId)
    ? profileId[0]
    : profileId;

  const { profiles, updateProfile, deleteProfile } = useProfiles();
  const selectedProfile = profiles.find(
    (profile) => profile.id.toString() === normalizedProfileId
  );

  const [name, setName] = useState(selectedProfile?.name ?? "");

  const [imagePath, setImagePath] = useState(
    selectedProfile?.imagePath ?? null
  );

  const [selectedImage, setSelectedImage] = useState(null);

  const [predictionEnabled, setPredictionEnabled] =
    useState(
      selectedProfile?.predictionEnabled ?? false
    );

  useEffect(() => {
    if (selectedProfile) {
      setName(selectedProfile.name);
      setImagePath(selectedProfile.imagePath ?? null);
      setSelectedImage(null);
      setPredictionEnabled(
        selectedProfile.predictionEnabled ?? false
      );
    }
  }, [selectedProfile]);

  if (!selectedProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-4 text-xl font-bold text-rose-700">
          הפרופיל לא נמצא
        </Text>

        <Link href="/" asChild>
          <Pressable className="rounded-xl bg-slate-200 px-6 py-3 active:bg-slate-300">
            <Text className="font-bold text-slate-900">
              חזרה לתפריט
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const previewImageUri = selectedImage?.uri
    ?? (imagePath ? getImageUrl(imagePath) : null);

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

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePath(null);
  };

  const handleSave = async () => {
    const cleanName = name.trim();

    if (cleanName === "") {
      Alert.alert("שגיאה", "חובה להזין שם לפרופיל");
      return;
    }

    try {
      await updateProfile(
        selectedProfile.id,
        {
          name: cleanName,
          imagePath,
          predictionEnabled,
        },
        selectedImage
      );

      router.replace("/");
    } catch {
      Alert.alert("שגיאה", "לא ניתן היה לעדכן את הפרופיל");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "מחיקת פרופיל",
      "האם אתה בטוח שברצונך למחוק את הפרופיל?",
      [
        {
          text: "ביטול",
          style: "cancel",
        },
        {
          text: "מחק",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProfile(selectedProfile.id);
              router.replace("/");
            } catch {
              Alert.alert("שגיאה", "לא ניתן היה למחוק את הפרופיל");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-6 text-2xl font-bold text-slate-900">
        הגדרות משתמש
      </Text>

      <View className="mb-6 flex-row-reverse items-end gap-6">
        <View className="w-80 items-center">
          <Text className="mb-2 text-right text-base font-bold text-slate-800">
            שם הפרופיל
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleSave}
            placeholder="הכנס שם לפרופיל"
            textAlign="center"
            maxLength={100}
            className="w-80 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
          />

          <View className="mt-4 w-80 flex-row-reverse items-center justify-between rounded-xl bg-indigo-100 px-4 py-2">
            <View>
              <Text className="text-right font-bold text-indigo-950">
                חיזוי המילה הבאה
              </Text>

              <Text className="text-right text-sm text-slate-600">
                {predictionEnabled ? "פעיל" : "כבוי"}
              </Text>
            </View>

            <Switch
              value={predictionEnabled}
              onValueChange={setPredictionEnabled}
              trackColor={{
                false: "#cbd5e1",
                true: "#a5b4fc",
              }}
              thumbColor={
                predictionEnabled
                  ? "#4338ca"
                  : "#64748b"
              }
            />
          </View>

        </View>

        <View className="w-40 items-center gap-2">
          <Text className="text-base font-bold text-slate-800">
            תמונת פרופיל
          </Text>

          {previewImageUri ? (
            <Image
              source={{ uri: previewImageUri }}
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

          {previewImageUri && (
            <Pressable
              onPress={handleRemoveImage}
              className="w-full items-center rounded-xl bg-rose-200 px-4 py-2 active:bg-rose-300"
            >
              <Text className="font-bold text-rose-950">
                הסר תמונה
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View className="w-80 flex-row gap-3">
        <Pressable
          onPress={handleSave}
          style={{ flex: 2 }}
          className="items-center rounded-xl bg-emerald-200 px-6 py-3 shadow-sm active:bg-emerald-300"
        >
          <Text className="text-base font-bold text-emerald-950">
            שמור שינויים
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

      <Pressable
        onPress={handleDelete}
        className="mt-6 w-80 items-center rounded-xl bg-rose-200 px-6 py-3 active:bg-rose-300"
      >
        <Text className="text-base font-bold text-rose-950">
          מחק פרופיל
        </Text>
      </Pressable>
    </View>
  );
}
