import React, { useContext } from "react";
import RegisterAndLoginForm from "./components/RegisterAndLoginForm";
import axios from "axios";
import { UserContext } from "./context/UserContext";
import Chat from "./components/Chat";

const App = () => {
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;
  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }
  return <RegisterAndLoginForm />;
};

export default App;
