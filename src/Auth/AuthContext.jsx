import { createContext, useContext, useState  } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const login = (userData, token) => {
        const roleArray = typeof userData.role === "string" ? [userData.role] : userData.role;
        const userWithRole = {...userData, role: roleArray};

        setUser(userWithRole);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(userWithRole));
        localStorage.setItem("token", token);
    }

    const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

