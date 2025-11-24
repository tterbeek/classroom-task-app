import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1️⃣ CHECK EXISTING SESSION BEFORE SHOWING LOGIN
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/classroom", { replace: true });
        return;
      }
      setCheckingSession(false);
    }
    checkSession();
  }, [navigate]);

  if (checkingSession) {
    return <div className="min-h-screen bg-white" />; // blank while checking
  }

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  async function sendOtp() {
    if (!isValidEmail(email)) return alert("Vul een geldig e-mailadres in.");

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);

    if (error) return alert("Kon geen code sturen: " + error.message);

    setCodeSent(true);
  }

  async function verifyOtp() {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);

    if (error) return alert("Code onjuist: " + error.message);

    navigate("/classroom", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-6">
          Inloggen voor leerkrachten
        </h1>

        {!codeSent ? (
          <>
            <input
              type="email"
              placeholder="E-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <button
              onClick={sendOtp}
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Versturen..." : "Stuur inlogcode"}
            </button>
          </>
        ) : (
          <>
            <p className="mb-2 text-gray-600">
              Vul de code in die naar {email} is gestuurd.
            </p>

            <input
              type="text"
              placeholder="Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            />

            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              {loading ? "Controleren..." : "Inloggen"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
