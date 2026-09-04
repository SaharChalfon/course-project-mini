import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfiles } from "../../context/ProfilesContext";

export default function SpokenSentencesHistory() {
  const { profileId } = useLocalSearchParams();
  const normalizedProfileId = Array.isArray(profileId)
    ? profileId[0]
    : profileId;

  const { profiles, spokenSentences } = useProfiles();
  const selectedProfile = profiles.find(
    (profile) => profile.id.toString() === normalizedProfileId
  );
  const sentences = spokenSentences.filter(
    (sentence) =>
      sentence.profileId.toString() === normalizedProfileId
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-slate-100 p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="rounded-xl bg-slate-200 px-6 py-3 active:bg-slate-300"
          >
            <Text className="text-base font-bold text-slate-900">
              חזרה
            </Text>
          </Pressable>

          <Text className="text-right text-3xl font-bold text-slate-900">
            היסטוריית משפטים{selectedProfile ? ` - ${selectedProfile.name}` : ""}
          </Text>
        </View>

        {sentences.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-bold text-slate-600">
              עדיין לא נשמרו משפטים עבור הפרופיל
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
          >
            {sentences.map((sentence) => (
              <View
                key={sentence.id}
                className="rounded-2xl border border-indigo-200 bg-white p-4"
              >
                <Text className="text-right text-xl font-bold text-slate-900">
                  {sentence.displayText}
                </Text>

                {sentence.spokenText !== sentence.displayText && (
                  <Text className="mt-2 text-right text-base text-slate-600">
                    הוקרא: {sentence.spokenText}
                  </Text>
                )}

                <Text className="mt-3 text-right text-sm text-slate-500">
                  {new Date(sentence.createdAt).toLocaleString("he-IL")}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
