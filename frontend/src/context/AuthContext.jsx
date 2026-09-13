import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../redux/authSlice";

// AuthContext exposes simple derived auth state (isAuthenticated, user)
// to any component in the tree without prop-drilling, while the actual
// auth data lives in Redux (single source of truth) and API calls go
// through Redux Toolkit thunks.
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // On first load, if we have a token but no user in memory yet,
  // ask the backend who we are (validates the token too).
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
