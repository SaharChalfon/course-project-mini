import { Link, useLocalSearchParams } from "expo-router"; // מאפשרת לקומפוננטה לקרוא פרמטרים שהגיעו דרך הכתובת
import * as Speech from "expo-speech";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfiles } from "../../context/ProfilesContext"; // מחזיר את הערכים שה־Provider משתף

const boardItems = [
  ["אני", "רוצה", "לא", "כן", "אוכל", "מים", "ללכת", "עזרה"],
  ["בית", "משפחה", "חבר", "שמח", "עצוב", "כואב", "עייף", "עוד"],
  ["שלום", "תודה", "בבקשה", "עכשיו", "אחר כך", "איפה", "מה", "מי"],
];

export default function Profile() {

  const { profileId } = useLocalSearchParams(); //  מחזיר אובייקט המכיל את הפרמטרים של המסך הנוכחי
  const { profiles } = useProfiles();

  const selectedProfile = profiles.find( // find() מחפשת את האיבר הראשון במערך שעומד בתנאי
    (profile) => profile.id.toString() === profileId // אם הביטוי שקר ממשיך הלאה אם הביטוי אמת מחזיר את האובייקט הנוכחי
  );

  const [sentenceWords, setSentenceWords] = useState([]); // מתחיל כמערך ריק

  const handleCellPress = (word) => {
    setSentenceWords((currentWords) => [
      ...currentWords, word // פורס את הרשימה הקיימת ומוסיף מילה
    ]);
  };

  const handleDeleteLast = () => { // מחיקת מילה אחרונה בשורה
    setSentenceWords((currentWords) =>
      currentWords.slice(0, -1) // התחל מהאיבר הראשון העתק עד האיבר האחרון, אך אל תכלול אותו
    );
  };

  const handleClearSentence = () => { // מחיקת כל המילים בשורה
    setSentenceWords([]); // מחליפה את רשימת המילים במערך ריק
  };

  const handlePlay = () => { // פונקציה לטיפול בניגון
    if (sentenceWords.length === 0) {
      return; // מונע ניסיון להקריא משפט ריק
    }

    const sentence = sentenceWords.join(" "); // מחבר את כל מילות המשפט עם רווח בינהן

    Speech.speak(sentence, {
      language: "he-IL", // שולחת את המשפט למנגנון ההקראה של המכשיר ומבקשת קול בעברית
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-slate-100 p-3">

        <View className="mb-3 h-12 flex-row items-center justify-between">
          <Link href="/" asChild>
            <Pressable className="h-full w-24 items-center justify-center rounded-xl bg-slate-800">
              <Text className="text-base font-bold text-white">
                תפריט
              </Text>
            </Pressable>
          </Link>

          <Pressable className="h-full w-24 items-center justify-center rounded-xl bg-slate-800">
            <Text className="text-base font-bold text-white">
              ראשי
            </Text>
          </Pressable>
        </View>

        <View className="mb-3 h-20 flex-row">

          <Pressable
            onPress={handleDeleteLast}
            onLongPress={handleClearSentence}
            className="w-24 items-center justify-center rounded-xl bg-red-600 active:bg-red-700"
          >
            <Text className="text-base font-bold text-white">
              מחק
            </Text>
          </Pressable>

          <ScrollView // שורת ההרכבה
            horizontal showsHorizontalScrollIndicator={false} // מאפשר גלילה לצדדים בלבד ומסתיר את פס הגלילה
            className="mx-3 flex-1 overflow-hidden rounded-xl border-2 border-slate-300 bg-white"
            contentContainerStyle={{
              flexGrow: 1,
              flexDirection: "row-reverse",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 12,
            }}
          >
            {sentenceWords.map((word, index) => ( // עובר על הרשימת מילים
              <Text
                key={`${word}-${index}`}
                className="text-lg font-bold text-slate-800"
              >
                {word}
              </Text>
            ))}
          </ScrollView>


          <Pressable
            onPress={handlePlay}
            className="w-24 items-center justify-center rounded-xl bg-green-600 active:bg-green-700"
          >
            <Text className="text-base font-bold text-white">
              נגן
            </Text>
          </Pressable>

          
        </View>

        <View className="flex-1 rounded-xl bg-slate-200 p-1">
          {boardItems.map((row, rowIndex) => ( // מכניס את המילים לגריד, קודם לפי השורות
            <View key={rowIndex} className="flex-1 flex-row">
              {row.map((word, columnIndex) => ( // ואז לפי עמודות
                <View
                  key={`${rowIndex}-${columnIndex}`}
                  className="flex-1 p-1"
                >
                  <Pressable
                    onPress={() => handleCellPress(word)}
                    className="flex-1 items-center justify-center rounded-lg border-2 border-slate-300 bg-white"
                  >
                    <Text className="text-base font-bold text-slate-800">
                      {word}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );

}