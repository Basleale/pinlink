import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(); // creating data pipline thing

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }); //initial empty state or load from localstorage

  const [loading, setLoading] = useState(null);

  //set user form localstorage for different pages
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if(storedUser){
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);


  //LOGOUT HANDLER - maybe I will adjust this so that the keep me logged in/remember me checkbox has an effect on this
  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}> {/** this allows us to pass down data to all children */}
      {children} {/** <App /> */}
    </AuthContext.Provider>
  );
}

export function useAuth() { //custom hook to access the data --- {user, setUser} = useAuth()
  return useContext(AuthContext);
}