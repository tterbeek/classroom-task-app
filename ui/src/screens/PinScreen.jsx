import { unlockDashboard } from "../auth/DashboardLock";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { useState, useRef, useEffect } from "react";

export default function PinScreen() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  // Autofocus the PIN input when the screen loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function checkPin() {
    const { data, error } = await supabase.rpc("check_pin", {
      input_pin: pin,
    });

    if (error || !data) {
      setError("Incorrecte pincode");
      return;
    }

    unlockDashboard();
    navigate("/dashboard");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      checkPin();
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">

      {/* Back button */}
      <button
        onClick={() => navigate("/classroom")}
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800"
      >
        ← Terug naar klasoverzicht
      </button>

      <h1 className="text-3xl mb-4">Pincode invoeren</h1>

      <input
        ref={inputRef}
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border p-2 rounded mb-3 text-center text-xl tracking-widest w-40"
      />

      <button
        onClick={checkPin}
        className="bg-blue-600 text-white px-6 py-2 rounded text-lg hover:bg-blue-700"
      >
        Ontgrendel
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
