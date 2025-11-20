import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";

// Screens
import TeacherMagicLinkLogin from "./components/TeacherMagicLinkLogin";
import ClassroomScreen from "./screens/ClassroomScreen";
import PinScreen from "./screens/PinScreen";
import TeacherDashboard from "./screens/TeacherDashboard";

function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;

      if (!session) {
        // Logged out → must go to login
        navigate("/", { replace: true });
      }
      // Logged in → DO NOT auto-redirect
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);

      // User logged out
      if (event === "SIGNED_OUT") {
        navigate("/", { replace: true });
        return;
      }

      // INITIAL_SESSION → Move from "/" to "/classroom"
      if (event === "INITIAL_SESSION" && session) {
        if (window.location.pathname === "/") {
          navigate("/classroom", { replace: true });
        }
        return;
      }

      // SIGNED_IN → Only redirect if coming from "/" (login page)
      if (event === "SIGNED_IN") {
        if (window.location.pathname === "/") {
          navigate("/classroom", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}


function App() {
  return (
    <BrowserRouter>
      <AuthListener />

      <Routes>
        {/* Login */}
        <Route path="/" element={<TeacherMagicLinkLogin />} />

        {/* Classroom View */}
        <Route path="/classroom" element={<ClassroomScreen />} />

        {/* PIN Entry */}
        <Route path="/pin" element={<PinScreen />} />

        {/* Teacher Dashboard */}
        <Route path="/dashboard" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
