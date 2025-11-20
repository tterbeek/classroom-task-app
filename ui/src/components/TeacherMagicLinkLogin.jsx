import { useState } from "react";
import supabase from "../supabaseClient";

export default function TeacherMagicLinkLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleMagicLink(e) {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (magicError) {
      setError(magicError.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Teacher Login
        </h2>

        {!sent && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="teacher@example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send Login Link"}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
          </form>
        )}

        {sent && (
          <div className="text-center space-y-2">
            <p className="text-green-600 font-semibold">
              ✔ A login link has been sent to <span className="font-bold">{email}</span>
            </p>
            <p className="text-gray-600 text-sm">Please check your inbox.</p>
          </div>
        )}
      </div>
    </div>
  );
}
