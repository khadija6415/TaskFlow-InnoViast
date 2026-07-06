import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, signupApi, getMeApi } from "../api/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("taskflow_token");
      const savedUser = localStorage.getItem("taskflow_user");

      if (token && savedUser) {
        try {
          const res = await getMeApi();
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem("taskflow_token");
          localStorage.removeItem("taskflow_user");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    localStorage.setItem("taskflow_token", res.data.token);
    localStorage.setItem("taskflow_user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const signup = async (name, email, password, role) => {
    const res = await signupApi({ name, email, password, role });
    localStorage.setItem("taskflow_token", res.data.token);
    localStorage.setItem("taskflow_user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};