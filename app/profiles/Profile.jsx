import { Link, router, useLocalSearchParams } from "expo-router"; // מאפשרת לקומפוננטה לקרוא פרמטרים שהגיעו דרך הכתובת
import * as Speech from "expo-speech";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { getImageUrl, useProfiles } from "../../context/ProfilesContext"; // מחזיר את הערכים שה־Provider משתף

export default function Profile() {

  const { profileId } = useLocalSearchParams(); //  מחזיר אובייקט המכיל את הפרמטרים של המסך הנוכחי
  const { profiles, boards, isEditorMode, saveSpokenSentence } = useProfiles();

  const selectedProfile = profiles.find( // find() מחפשת את האיבר הראשון במערך שעומד בתנאי
    (profile) => profile.id.toString() === profileId // אם הביטוי שקר ממשיך הלאה אם הביטוי אמת מחזיר את האובייקט הנוכחי
  );

  const profileBoards = boards.filter(
    (board) =>
      board.profileId.toString() === profileId // מציג רק את הלוחות של אותו פרופיל
  );

  const rootBoard = profileBoards.find(
    (board) => board.isRoot
  );

  const [currentBoardId, setCurrentBoardId] = useState(
    rootBoard?.id ?? null
  ); // שומר את מזהה הלוח שמוצג כרגע. בהתחלה זהו הלוח הראשי של הפרופיל

  const currentBoard = profileBoards.find(
    (board) => board.id === currentBoardId
  ); // מוצא בלוחות הפרופיל את הלוח שהמזהה שלו שווה למזהה הלוח הנוכחי

  const [sentenceCards, setSentenceCards] = useState([]); // יצירת "מצב" (סטייט) של רשימת הכרטיסים שנבחרו

  const handleCellPress = (card) => {
    if (card.label.trim() === "") {
      return;
    }

    if (
      card.cardType === "navigation" &&
      card.targetBoardId !== null
    ) {
      setCurrentBoardId(card.targetBoardId);
      return; // לאחר המעבר ללוח היעד, הפונקציה מסתיימת ולכן כרטיס הניווט אינו מתווסף למשפט
    }

    setSentenceCards((currentCards) => [
      ...currentCards, card]);
  }; // פורס את הרשימה הקיימת ומוסיף את הכרטיס שנבחר

  const handleCellLongPress = (card) => {
    router.push({
      pathname: "/profiles/edit-card",
      params: {
        boardId: currentBoard.id,
        cardId: card.id,
      },
    });
  };

  const handleDeleteLast = () => { // מחיקת הכרטיס האחרון בשורה
    setSentenceCards((currentCards) =>
      currentCards.slice(0, -1) // העתקה: התחל מהאיבר הראשון עד האיבר האחרון, אך אל תכלול את האיבר האחרון
    );
  };

  const handleClearSentence = () => { // מחיקת כל הכרטיסים בשורה
    setSentenceCards([]); // מחליפה את רשימת הכרטיסים במערך ריק
  };

  const handlePlay = async () => { // פונקציה לטיפול בניגון
    if (sentenceCards.length === 0) {
      return; // מונע ניסיון להקריא משפט ריק
    }

    const displaySentence = sentenceCards.map((card) => card.label).join(" ");
    const spokenSentence = sentenceCards.map((card) => card.spokenText).join(" ");
    // עובר על רשימת האובייקטים (כרטיסים) ומחבר את כל מילות המשפט עם רווח בינהן

    Speech.speak(spokenSentence, {
      language: "he-IL", // שולח את המשפט למנגנון ההקראה של המכשיר ומבקש קול בעברית
      rate: 0.6,
    });

    // במצב עורך מקריאים את המשפט בלי לשמור אותו בהיסטוריה
    if (isEditorMode) {
      return;
    }

    try {
      await saveSpokenSentence(
        selectedProfile.id,
        displaySentence,
        spokenSentence
      );
    } catch {
      Alert.alert("שגיאה", "המשפט הושמע אך לא נשמר בהיסטוריה");
    }
  };

  const handleHomePress = () => {
    setCurrentBoardId(rootBoard.id);
  };

  if (!selectedProfile || !rootBoard || !currentBoard) {
    return null; // מונע קריסה אם הפרופיל או הלוחות שלו נמחקו בזמן שהמסך עדיין קיים במחסנית הניווט
  }

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

          {isEditorMode && (
            <Text className="text-base font-bold text-amber-700">
              מצב עריכה פעיל
            </Text>
          )}

          <Pressable
            onPress={handleHomePress}
            className="h-full w-24 items-center justify-center rounded-xl bg-slate-800"
          >
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
            {sentenceCards.map((card, index) => (
              <View key={`${card.id}-${index}`} className="flex-row-reverse items-center gap-2 rounded-lg bg-slate-50 px-2 py-1">
                {card.imagePath ? (
                  <Image source={{ uri: getImageUrl(card.imagePath) }} resizeMode="cover" className="h-8 w-8 rounded-md bg-slate-200" />
                ) : (<Text className="text-lg font-bold text-slate-800">{card.label}</Text>)}
              </View> // אם יש תמונה תכנוס התמונה לשורת ההרכבה אם אין אז טקסט
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
          {currentBoard.cards.map((row, rowIndex) => ( // מכניס את המילים לגריד, קודם לפי השורות
            <View key={rowIndex} className="flex-1 flex-row">
              {row.map((card) => (
                <View
                  key={card.id}
                  className="flex-1 p-1"
                >

                  <Pressable
                    onPress={() => handleCellPress(card)}
                    onLongPress={isEditorMode ? () => handleCellLongPress(card) : undefined}
                    className={`
                        flex-1 items-center justify-center rounded-lg border-2
                        ${isEditorMode
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-300 bg-white"}`}
                  >
                    {card.imagePath && (
                      <Image
                        source={{ uri: getImageUrl(card.imagePath) }}
                        resizeMode="cover"
                        className="mb-1 h-10 w-10 rounded-md bg-slate-200"
                      />
                    )}

                    <Text
                      numberOfLines={1}
                      className="text-sm font-bold text-slate-800"
                    >
                      {card.label}
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
