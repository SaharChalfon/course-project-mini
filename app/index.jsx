import { Link, router } from "expo-router";
import { styled } from 'nativewind';
import { useState } from "react";
import { Alert, Image, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { getImageUrl, useProfiles } from "../context/ProfilesContext";

const SafeAreaView = styled(RNSafeAreaView);
const EDITOR_PIN = "1234";


export default function Index() {

  const {
    profiles,
    isEditorMode,
    loadSpokenSentences,
    toggleEditorMode,
  } = useProfiles();
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const closePinModal = () => {
    setIsPinModalVisible(false);
    setPin("");
    setPinError("");
  };

  const handleEditorModePress = () => {
    if (isEditorMode) {
      toggleEditorMode();
      return;
    }

    setPin("");
    setPinError("");
    setIsPinModalVisible(true);
  };

  const handlePinSubmit = () => {
    if (pin !== EDITOR_PIN) {
      setPin("");
      setPinError("הקוד שהוזן שגוי");
      return;
    }

    toggleEditorMode();
    closePinModal();
  };

  const handleHistoryPress = async (profileId) => {
    try {
      await loadSpokenSentences(profileId);

      router.push({
        pathname: "/profiles/history",
        params: { profileId: profileId.toString() },
      });
    } catch {
      Alert.alert(
        "שגיאה",
        "לא ניתן היה לטעון את היסטוריית המשפטים"
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-5">

      <Link href="/About" asChild>
        <Pressable
          className="
          absolute bottom-6 right-6
          min-w-32 items-center
          rounded-xl bg-sky-200
          px-6 py-3
          shadow-sm active:bg-sky-300"
        >
          <Text className="text-base font-bold text-sky-950">
            אודות
          </Text>
        </Pressable>
      </Link>

      <View className="w-full items-center gap-3">
        <Text className="mb-2 text-2xl font-bold text-slate-900">
          תפריט משתמשים
        </Text>

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
                  h-16 w-96
                  flex-row-reverse items-center justify-center gap-4
                  rounded-xl bg-indigo-200
                  px-5 shadow-sm
                  active:bg-indigo-300"
              >
                {profile.imagePath && (
                  <Image
                    source={{ uri: getImageUrl(profile.imagePath) }}
                    resizeMode="cover"
                    className="h-12 w-12 rounded bg-indigo-100"
                  />
                )}

                <Text className="text-lg font-bold text-indigo-950">
                  {profile.name}
                </Text>
              </Pressable>
            </Link>

            {isEditorMode && (
              <>
                <Pressable
                  onPress={() => handleHistoryPress(profile.id)}
                  className="items-center rounded-lg bg-violet-200 px-4 py-3 active:bg-violet-300"
                >
                  <Text className="font-bold text-violet-950">
                    היסטוריה
                  </Text>
                </Pressable>

                <Link
                  href={{
                    pathname: "/profiles/settings",
                    params: {
                      profileId: profile.id.toString(),
                    },
                  }}
                  asChild
                >
                  <Pressable className="items-center rounded-lg bg-amber-200 px-4 py-3 active:bg-amber-300">
                    <Text className="font-bold text-amber-950">
                      הגדרות
                    </Text>
                  </Pressable>
                </Link>
              </>
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
          rounded-xl bg-emerald-200
          px-6 py-3
          shadow-sm active:bg-emerald-300"
          >
            <Text className="text-base font-bold text-emerald-950">
              צור פרופיל חדש
            </Text>
          </Pressable>
        </Link>
      )}

      <Pressable
        onPress={handleEditorModePress}
        className={`
          absolute bottom-6 left-6
          min-w-32 items-center
          rounded-xl px-6 py-3
          shadow-md

          ${isEditorMode ? "bg-amber-200 active:bg-amber-300" : "bg-slate-200 active:bg-slate-300"}`} // אם isEditorMode == true אז שמאל אם false אז ימין
      >
        <Text className="text-base font-bold text-slate-900">
          מצב עורך
        </Text>
      </Pressable>

      {isPinModalVisible && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/50 p-6">
          <Pressable
            onPress={Keyboard.dismiss}
            className="absolute inset-0"
          />

          <View
            style={{ width: 460, minHeight: 280 }}
            className="items-center justify-center rounded-2xl bg-white p-6 shadow-lg"
          >
            <Text className="mb-2 text-xl font-bold text-slate-800">
              כניסה למצב עורך
            </Text>

            <Text className="mb-4 text-center text-slate-600">
              הזן קוד בן 4 ספרות
            </Text>

            <TextInput
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                setPinError("");
              }}
              onSubmitEditing={handlePinSubmit}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              textAlign="center"
              className="mb-2 w-48 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xl tracking-widest"
            />

            {pinError ? (
              <Text className="mb-2 text-red-600">{pinError}</Text>
            ) : null}

            <View className="mt-2 flex-row-reverse gap-3">
              <Pressable
                onPress={handlePinSubmit}
                className="rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-700"
              >
                <Text className="font-bold text-white">אישור</Text>
              </Pressable>

              <Pressable
                onPress={closePinModal}
                className="rounded-xl bg-slate-200 px-6 py-3 active:bg-slate-300"
              >
                <Text className="font-bold text-slate-700">ביטול</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
