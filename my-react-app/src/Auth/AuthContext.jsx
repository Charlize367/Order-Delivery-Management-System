import { createContext, useContext, useState  } from "react";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("jwtToken") || null);
    const [logoutPopup, setLogoutPopup] = useState(false);
    

    const login = (userData, token) => {
        const roleArray = typeof userData.role === "string" ? [userData.role] : userData.role;
        const userWithRole = {...userData, role: roleArray};


        const id = userData.id;
        setUser(userWithRole);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(userWithRole));
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("user_ID", id);
        console.log(token);
        console.log(userWithRole);
        console.log(id);
    
        
    }

    const userLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
    

  
    setLogoutPopup(true);
  
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, userLogout, logoutPopup, setLogoutPopup}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

