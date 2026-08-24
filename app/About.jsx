import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // מונע מהתוכן להיכנס לאזור המצלמה, שורת המצב וקצוות המסך

const About = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 p-5">
        {/* כותרת וכפתור חזרה */}
        <View className="mb-4 flex-row items-center justify-between">
          <Link href="/" asChild>
            <Pressable className="rounded-xl bg-slate-200 px-6 py-3 active:bg-slate-300">
              <Text className="text-base font-bold text-slate-900">
                חזרה
              </Text>
            </Pressable>
          </Link>

          <View className="items-end">
            <Text className="text-3xl font-bold text-slate-900">
              אודות האפליקציה
            </Text>
          </View>
        </View>

        {/* תוכן המסך */}
        <View className="flex-1 flex-row-reverse gap-4">
          {/* הסבר על האפליקציה */}
          <View className="flex-1 rounded-2xl border border-sky-200 bg-sky-100 p-5">
            <Text className="mb-4 text-right text-2xl font-bold text-sky-950">
              מהי מטרת האפליקציה?
            </Text>

            <Text className="text-right text-base leading-7 text-slate-700">
              האפליקציה היא כלי לתקשורת תומכת וחליפית - תת"ח, המיועד
              לאנשים שאינם מדברים או שמתקשים להביע את עצמם באמצעות
              דיבור.
            </Text>

            <Text className="mt-3 text-right text-base leading-7 text-slate-700">
              כל משתמש יכול לבחור פרופיל אישי, לפתוח לוח תקשורת
              ולבחור מילים או תמונות. הפריטים שנבחרו מתחברים למשפט
              שאפשר להקריא בקול.
            </Text>

            <Text className="mt-3 text-right text-base leading-7 text-slate-700">
              הפעל את מצב העורך כדי ליצור
              פרופיל חדש, לערוך לוחות ותאים או למחוק פרופיל קיים.
            </Text>
          </View>

          {/* הוראות שימוש */}
          <View className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-100 p-5">
            <Text className="mb-4 text-right text-2xl font-bold text-emerald-950">
              איך משתמשים בלוח?
            </Text>

            <Text className="mb-3 text-right text-base leading-6 text-slate-700">
              <Text className="font-bold text-slate-900">
                בחירת פרופיל:{" "}
              </Text>
              בוחרים את הפרופיל הרצוי במסך הראשי.
            </Text>

            <Text className="mb-3 text-right text-base leading-6 text-slate-700">
              <Text className="font-bold text-slate-900">
                הרכבת משפט:{" "}
              </Text>
              לוחצים על מילים בלוח והן מתווספות לשורת ההרכבה.
            </Text>

            <Text className="mb-3 text-right text-base leading-6 text-slate-700">
              <Text className="font-bold text-slate-900">
                תיקון המשפט:{" "}
              </Text>
              לחיצה על ״מחק״ מסירה את המילה האחרונה, לחיצה ארוכה
              מנקה את כל המשפט.
            </Text>

            <Text className="mb-3 text-right text-base leading-6 text-slate-700">
              <Text className="font-bold text-slate-900">
                השמעה:{" "}
              </Text>
              לוחצים על ״נגן״ כדי להקריא בקול את המשפט שהורכב.
            </Text>

          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default About;
