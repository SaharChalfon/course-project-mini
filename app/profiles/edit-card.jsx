import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfiles } from "../../context/ProfilesContext";


export default function EditCard() {
  const { boardId, cardId } = useLocalSearchParams();
  const { boards, updateCard } = useProfiles();

  const selectedBoard = boards.find(
    (board) => board.id.toString() === boardId
  );

  const selectedCard = selectedBoard?.cards
    .flat()
    .find((card) => card.id.toString() === cardId);

  const [label, setLabel] = useState(
    selectedCard?.label ?? ""
  );

  const [spokenText, setSpokenText] = useState(
    selectedCard?.spokenText ?? ""
  );

  const handleSave = () => {
    const cleanLabel = label.trim();
    const cleanSpokenText = spokenText.trim();

    if (cleanLabel === "" || cleanSpokenText === "") {
      Alert.alert(
        "שגיאה",
        "חובה למלא את שני השדות"
      );
      return;
    }

    updateCard(boardId, cardId, {
      label: cleanLabel,
      spokenText: cleanSpokenText,
    });

    router.back();
  };

  if (!selectedCard) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center bg-slate-100 p-6">
        <Text className="mb-6 text-2xl font-bold text-slate-900">
          עריכת תא
        </Text>

        <View className="w-96 gap-4">
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
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}