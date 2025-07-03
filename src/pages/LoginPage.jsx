import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL;

function LoginPage({ setIsAuth }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 清除 submit 預設行為
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      // 將 Token 儲存至 cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // Global axios defaults
      axios.defaults.headers.common.Authorization = token;
      // 取得產品列表
      // getProductData();
      // 通過登入驗證
      setIsAuth(true);
    } catch (error) {
      alert("登入失敗: " + error.response.data.message);
    }
  };

  useEffect(() => {
    // 從 cookie 取得 token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    // Global axios defaults
    axios.defaults.headers.common.Authorization = token;

    // 初始化 Modal
    // productModalRef.current = new bootstrap.Modal("#productModal", {keyboard: false,});

    // 驗證登錄
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      await axios.post(`${API_BASE}/api/user/check`);
      // getProductData();
      setIsAuth(true);
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  return (
    <div className="container login">
      <div className="row justify-content-center">
        <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
        <div className="col-8">
          <form id="form" className="form-signin" onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoFocus
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-lg btn-primary w-100 mt-3" type="submit">
              登入
            </button>
          </form>
        </div>
      </div>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>
  );
}

export default LoginPage;
