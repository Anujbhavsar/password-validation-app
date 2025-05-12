import React, { useState, type CSSProperties } from "react";

interface CreateUserFormProps {
  onSuccess: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [apiMessage, setApiMessage] = useState("");

  const validatePassword = (pwd: string): string[] => {
    const validation: string[] = [];

    if (pwd.length < 10) validation.push("Password must be at least 10 characters.");
    if (pwd.length > 24) validation.push("Password must be at most 24 characters.");
    if (/\s/.test(pwd)) validation.push("Password can't contain spaces.");
    if (!/[0-9]/.test(pwd)) validation.push("Include at least one number.");
    if (!/[A-Z]/.test(pwd)) validation.push("Include at least one uppercase letter.");
    if (!/[a-z]/.test(pwd)) validation.push("Include at least one lowercase letter.");

    return validation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiMessage("");

    const validationErrors = validatePassword(password);
    setErrors(validationErrors);

    if (!username || validationErrors.length > 0) return;

    try {
      const res = await fetch(
        "https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYW51amJoYXZzYXIyMDZAZ21haWwuY29tIl0sImlzcyI6Imhlbm5nZS1hZG1pc3Npb24tY2hhbGxlbmdlIiwic3ViIjoiY2hhbGxlbmdlIn0.j4A9etyM0Kzaxq7WemzN8Yty19e4u0l2Vp9x4lvWrkI",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("User created:", data);
        onSuccess();
      } else {
        if (res.status === 401 || res.status === 403) {
          setApiMessage("You're not authorized to access this.");
        } else if (res.status === 400) {
          if (data.message?.includes("not allowed")) {
            setApiMessage("This password isn't allowed. Try something else.");
          } else {
            setApiMessage(`Error: ${data.message || "Invalid input."}`);
          }
        } else if (res.status === 500) {
          setApiMessage("Server issue. Please try again later.");
        } else {
          setApiMessage("Something went wrong. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setApiMessage("Couldn't connect. Please try again.");
    }
  };

  return (
    <div style={formWrapper}>
      <form onSubmit={handleSubmit} style={form}>
        <label htmlFor="username" style={formLabel}>
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setApiMessage("");
          }}
          style={formInput}
          aria-invalid={!username}
        />

        <label htmlFor="password" style={formLabel}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            const value = e.target.value;
            setPassword(value);
            setErrors(validatePassword(value));
            setApiMessage("");
          }}
          style={formInput}
          aria-invalid={errors.length > 0}
        />

        {errors.length > 0 && (
          <ul style={{ paddingLeft: 16, margin: "4px 0", color: "crimson" }}>
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}

        {!errors.length && apiMessage && (
          <div style={{ color: "red", marginTop: 4 }}>{apiMessage}</div>
        )}

        <button type="submit" style={formButton}>
          Create User
        </button>
      </form>
    </div>
  );
};

export default CreateUserForm;

// --- Styling ---
const formWrapper: CSSProperties = {
  maxWidth: "500px",
  width: "80%",
  backgroundColor: "#efeef5",
  padding: "24px",
  borderRadius: "8px",
};

const form: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: "none",
  padding: "8px 16px",
  height: "40px",
  fontSize: "14px",
  backgroundColor: "#f8f7fa",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  borderRadius: "4px",
};

const formButton: CSSProperties = {
  marginTop: "8px",
  alignSelf: "flex-end",
  height: "40px",
  padding: "0 16px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#7135d2",
  color: "#fff",
  fontWeight: 500,
  fontSize: "16px",
  cursor: "pointer",
};
