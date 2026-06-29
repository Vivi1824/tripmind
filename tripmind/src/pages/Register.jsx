import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const { error } = await register(email, password);

    if (error) {
      setMessage({ type: "error", text: error.message || "Unable to register." });
    } else {
      setMessage({ type: "success", text: "Registration successful. You can now log in." });
      setTimeout(() => navigate("/login"), 600);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="w-full border p-2 mb-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message.text && (
        <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}