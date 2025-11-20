import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // STEP 1: SEND OTP EMAIL
  const sendOtp = async () => {
    if (!isValidEmail(email)) {
      alert("Vul een geldig e-mailadres in.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }, // allow auto-signup
    });

    setLoading(false);

    if (error) {
      alert("Kon geen code sturen: " + error.message);
      return;
    }

    setCodeSent(true);
  };

  // STEP 2: VERIFY OTP
  const verifyOtp = async () => {
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setLoading(false);

    if (error) {
      alert("Code onjuist: " + error.message);
      return;
    }

    navigate("/classroom"); // SUCCESS 🎉
  };

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
              Vul de 6-cijferige code in die naar {email} is gestuurd.
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
