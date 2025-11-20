import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";

import TeacherLogin from "./components/TeacherLogin";
import ClassroomScreen from "./screens/ClassroomScreen";
import PinScreen from "./screens/PinScreen";
import ChangePinScreen from "./screens/ChangePinScreen";
import TeacherDashboard from "./screens/TeacherDashboard";



function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;

      if (!session) {
        navigate("/", { replace: true });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);

      if (event === "SIGNED_OUT") {
        navigate("/", { replace: true });
      }

      if (event === "SIGNED_IN") {
        navigate("/classroom", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthListener />

      <Routes>
        <Route path="/" element={<TeacherLogin />} />
        <Route path="/classroom" element={<ClassroomScreen />} />
        <Route path="/pin" element={<PinScreen />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="/change-pin" element={<ChangePinScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
