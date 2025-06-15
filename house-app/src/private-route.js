import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ setModalText, children }) => {
 const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setModalText("Сесія завершена. Будь ласка, увійдіть повторно.");
      setIsValid(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp < now) {
        setModalText("Сесія завершена. Будь ласка, увійдіть повторно.");
        localStorage.removeItem("token");
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } catch {
      setModalText("Некоректний токен. Увійдіть повторно.");
      setIsValid(false);
    }
  }, [setModalText]);

  if (isValid === null) return null;
  if (!isValid) return <Navigate to="/sign-in" replace />;

  return children;
};