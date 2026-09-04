# AAC Communication Board

אפליקציית תקשורת תומכת וחליפית (AAC), המאפשרת לבחור פרופיל,
להרכיב משפט בעזרת מילים ותמונות ולהשמיע אותו בקול.

האפליקציה מותאמת לתצוגה אופקית ופועלת דרך Expo Go.

> מצב נוכחי: הפרויקט עדיין משתמש ב־Expo SDK 54. השינויים האחרונים מומשו בקוד המקומי וממתינים לבדיקה באייפון לאחר שדרוג הדרגתי ל־SDK 57.

## יכולות עיקריות

- יצירה, עריכה ומחיקה של פרופילים עם תמונה אופציונלית
- לוח תקשורת קבוע של 3 שורות ו־8 עמודות
- כרטיסי תוכן וכרטיסי ניווט
- יצירת לוחות־בן
- עריכת טקסט ותמונה בכרטיסים
- הוספת ניקוד ידני לטקסט שמוקרא
- בחירת תמונה מהגלריה או צילום במצלמה
- הרכבת משפט והשמעתו בעברית
- חיזוי אישי של המילה הבאה באמצעות Trigram ו־Bigram
- שמירת היסטוריית המשפטים שהושמעו לכל פרופיל
- מצב עורך מוגן בקוד PIN לניהול הפרופילים והכרטיסים

## טכנולוגיות

### אפליקציה

- React Native
- Expo
- Expo Router
- Expo Speech
- Expo Image Picker
- NativeWind

### שרת

- ASP.NET Core Web API
- C# ו־.NET 9
- ADO.NET
- SQL Server Express


## הרצה

open 2 terminals on main folder and run:

Server:
dotnet run --project server/AacApi/AacApi/AacApi.csproj --launch-profile http

Client:
npm start

And then scan the QR with phone. Both must be on the same WiFi.
