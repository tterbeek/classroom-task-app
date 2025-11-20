import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function ChangePinScreen() {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function savePin() {
    setError("");
    setSuccess("");

    if (pin.length !== 4 || isNaN(pin)) {
      setError("PIN moet 4 cijfers zijn.");
      return;
    }

    if (pin !== confirm) {
      setError("De PIN-codes komen niet overeen.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: updateError } = await supabase
      .from("teachers")
      .update({ pin_code: pin })
      .eq("id", user.id);

    if (updateError) {
      setError("Fout bij opslaan.");
      return;
    }

    setSuccess("PIN succesvol gewijzigd!");
    setTimeout(() => navigate("/dashboard"), 1000);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        ← Terug
      </button>

      <h1 className="text-3xl mb-4">Nieuwe PIN instellen</h1>

      <input
        type="password"
        placeholder="Nieuwe PIN"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="border p-3 rounded mb-3 w-64 text-center text-2xl tracking-widest"
      />

      <input
        type="password"
        placeholder="Herhaal PIN"
        maxLength={4}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="border p-3 rounded mb-3 w-64 text-center text-2xl tracking-widest"
      />

      <button
        onClick={savePin}
        className="bg-blue-600 text-white px-6 py-2 rounded text-lg"
      >
        Opslaan
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}
      {success && <p className="text-green-600 mt-3">{success}</p>}
    </div>
  );
}
