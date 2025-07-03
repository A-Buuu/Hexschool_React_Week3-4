import { useState } from "react";

import "./assets/style.css";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";

function App() {
  // 使用者登錄驗證
  const [isAuth, setIsAuth] = useState(false);

  // 畫面渲染
  return (
    <>
      {isAuth ? (
        <ProductPage />
      ) : (
        <LoginPage setIsAuth={setIsAuth} />
      )}
    </>
  );
}

export default App
