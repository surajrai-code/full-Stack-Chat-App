import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const [kindlyText, setKindlyText] = useState("Kindly Login");

  async function handleSubmit(ev) {
    ev.preventDefault();
    try {
      const url = isLoginOrRegister === "register" ? "register" : "login";
      const { data } = await axios.post(`/api/users/${url}`, {
        username,
        password,
      });
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Conflict - username already exists
        setUsernameError("Username already exists");
      } else if (error.response && error.response.status === 401) {
        // Unauthorized - invalid username or password
        setUsernameError(isLoginOrRegister === "login" ? "Invalid username or password" : "");
        setPasswordError(isLoginOrRegister === "login" ? "Invalid username or password" : "");
      } else {
        // Other errors
        console.error("An error occurred:", error.message);
      }
    }
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <div className="text-center mt-2">
          <h1 style={{fontSize: "2rem", fontStyle:"italic", color: "blue"}}>{kindlyText}</h1>
        </div>
        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        {usernameError && <p className="text-red-500 text-xs">{usernameError}</p>}
        <input
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?
              <button
                className="ml-1"
                onClick={() => {
                  setIsLoginOrRegister("login");
                  setUsernameError("");
                  setPasswordError("");
                  setKindlyText("Kindly Login");
                }}
              >
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              Don't have an account?
              <button
                className="ml-1"
                onClick={() => {
                  setIsLoginOrRegister("register");
                  setUsernameError("");
                  setPasswordError("");
                  setKindlyText("Kindly Register");
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
