import { Stack } from "expo-router";
import { ProfilesProvider } from "../context/ProfilesContext.jsx";
import "./global.css";


export default function RootLayout() {
  return (
    <ProfilesProvider>
      <Stack
        screenOptions={{ headerShown: false }}
      />
    </ProfilesProvider>
  );
}
