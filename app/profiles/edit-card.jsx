import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getImageUrl, useProfiles } from "../../context/ProfilesContext";


export default function EditCard() {
  const { boardId, cardId } = useLocalSearchParams();
  const { boards, updateCard, deleteCard } = useProfiles();
  const selectedBoard = boards.find((board) => board.id.toString() === boardId);
  const selectedCard = selectedBoard?.cards.flat().find((card) => card.id.toString() === cardId);
  const canNavigate = selectedBoard?.isRoot === true;
  const [label, setLabel] = useState(selectedCard?.label ?? "");
  const [spokenText, setSpokenText] = useState(selectedCard?.spokenText ?? "");
  const [imagePath, setImagePath] = useState(selectedCard?.imagePath ?? null); // ערך ברירת המחדל הוא הוא ריק או כתובת התמונה במידה ויש
  const [selectedImage, setSelectedImage] = useState(null);
  const [cardType, setCardType] = useState(canNavigate ? selectedCard?.cardType ?? "content" : "content");


  const handleSave = async () => {
    const cleanLabel = label.trim();
    const cleanSpokenText = spokenText.trim();

    if (cleanLabel === "" || cleanSpokenText === "") {
      Alert.alert(
        "שגיאה",
        "חובה למלא את שני השדות"
      );
      return;
    }

    try {
      await updateCard(
        boardId,
        cardId,
        {
          label: cleanLabel,
          spokenText: cleanSpokenText,
          imagePath,
          cardType: canNavigate ? cardType : "content",
        },
        selectedImage
      );

      router.back();
    } catch {
      Alert.alert("שגיאה", "לא ניתן היה לשמור את הכרטיס");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "מחיקת כרטיס",
      "האם למחוק את הכרטיס? אם זהו כרטיס ניווט, גם הלוח שלו יימחק.",
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
              await deleteCard(boardId, cardId);
              router.back();
            } catch {
              Alert.alert("שגיאה", "לא ניתן היה למחוק את הכרטיס");
            }
          },
        },
      ]
    );
  };


  if (!selectedCard) {
    return null;
  }

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImagePath(result.assets[0].uri);
        setSelectedImage(result.assets[0]);
      }

    } catch {
      Alert.alert("שגיאה", "לא ניתן היה לבחור תמונה מהגלריה");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "אין הרשאה למצלמה",
          "כדי לצלם תמונה יש לאפשר לאפליקציה להשתמש במצלמה"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImagePath(result.assets[0].uri);
        setSelectedImage(result.assets[0]);
      }
    } catch {
      Alert.alert("שגיאה", "לא ניתן היה לצלם תמונה");
    }
  };


  const handleRemoveImage = () => {
    setImagePath(null);
    setSelectedImage(null);
  };



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center bg-slate-100 p-6">
        <Text className="mb-6 text-2xl font-bold text-slate-900">
          עריכת תא
        </Text>

        <View className="w-full max-w-5xl flex-row-reverse items-center gap-4">
          <View className="flex-1 gap-4">
            <View>
              <Text className="mb-2 text-right font-bold text-slate-800">
                טקסט שמוצג בכרטיס
              </Text>

              <TextInput
                value={label}
                onChangeText={setLabel}
                textAlign="right"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
              />
            </View>

            <View>
              <Text className="mb-2 text-right font-bold text-slate-800">
                טקסט שיוקרא
              </Text>

              <TextInput
                value={spokenText}
                onChangeText={setSpokenText}
                textAlign="right"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
              />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={handleSave}
                className="flex-1 items-center rounded-xl bg-emerald-200 px-6 py-3 active:bg-emerald-300"
              >
                <Text className="font-bold text-emerald-950">
                  שמור
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.back()}
                className="flex-1 items-center rounded-xl bg-slate-200 px-6 py-3 active:bg-slate-300"
              >
                <Text className="font-bold text-slate-900">
                  ביטול
                </Text>
              </Pressable>

              {selectedCard.label.trim() !== "" && (
                <Pressable
                  onPress={handleDelete}
                  className="flex-1 items-center rounded-xl bg-rose-200 px-6 py-3 active:bg-rose-300"
                >
                  <Text className="font-bold text-rose-950">
                    מחק
                  </Text>
                </Pressable>
              )}

            </View>

          </View>

          {canNavigate && (
            <View className="w-44">
              <Text className="mb-2 text-right font-bold text-slate-800">
                סוג הכרטיס
              </Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setCardType("content")}
                  className={`
                    flex-1 items-center rounded-xl px-4 py-3
                    ${cardType === "content"
                      ? "bg-emerald-200"
                      : "bg-slate-200"}`}
                >
                  <Text className="font-bold text-slate-900">
                    תוכן
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setCardType("navigation")}
                  className={`
                    flex-1 items-center rounded-xl px-4 py-3
                    ${cardType === "navigation"
                      ? "bg-indigo-200"
                      : "bg-slate-200"}`}
                >
                  <Text className="font-bold text-slate-900">
                    ניווט
                  </Text>
                </Pressable>
              </View>
            </View>
          )}



          <View className="w-44 items-center gap-3">
            {imagePath ? (
              <Image source={{ uri: getImageUrl(imagePath) }} resizeMode="cover" className="h-32 w-32 rounded-xl bg-slate-200" />
            ) : (
              <View className="h-32 w-32 items-center justify-center rounded-xl bg-slate-200">
                <Text className="font-bold text-slate-600">אין תמונה</Text>
              </View>
            )}

            <View className="w-full flex-row gap-3">
              <Pressable onPress={handlePickImage} className="flex-1 items-center rounded-xl bg-sky-200 px-4 py-3 active:bg-sky-300">
                <Text className="font-bold text-sky-950">
                  גלריה
                </Text>
              </Pressable>

              <Pressable onPress={handleTakePhoto} className="flex-1 items-center rounded-xl bg-violet-200 px-4 py-3 active:bg-violet-300">
                <Text className="font-bold text-violet-950">
                  מצלמה
                </Text>
              </Pressable>
            </View>

            {imagePath && (
              <Pressable onPress={handleRemoveImage} className="w-full items-center rounded-xl bg-rose-200 px-4 py-3 active:bg-rose-300">
                <Text className="font-bold text-rose-950">הסר תמונה</Text>
              </Pressable>
            )}
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
