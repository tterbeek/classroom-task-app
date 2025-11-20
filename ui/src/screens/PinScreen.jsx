import { unlockDashboard } from "../auth/DashboardLock";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { useState } from "react";

export default function PinScreen() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function checkPin() {
    const { data, error } = await supabase.rpc("check_pin", {
      input_pin: pin
    });

    if (error || !data) {
      setError("Incorrect PIN");
      return;
    }

    unlockDashboard();   // <-- *** THIS FIXES EVERYTHING ***
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <button
  onClick={() => navigate("/classroom")}
  className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800"
>
  ← Back to Classroom
</button>
      <h1 className="text-3xl mb-4">Enter PIN</h1>

      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="border p-2 rounded mb-3"
      />

      <button
        onClick={checkPin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Unlock
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
