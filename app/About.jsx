import { Link } from 'expo-router';
import { styled } from 'nativewind';
import { Pressable, Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);


const About = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <Text>מטרת האפליקציה לאפשר לאנשים לא ורבלים לתקשר בעזרת סמלים והקראת טקסט באופן מלאכותי גע</Text>
      <Link href="/" asChild>
        <Pressable className="rounded-xl bg-slate-800 px-6 py-3">
          <Text className="font-bold text-white">
            חזרה
          </Text>
        </Pressable>
      </Link>

    </SafeAreaView>
  )
}

export default About