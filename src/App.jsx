import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import * as bootstrap from "bootstrap";
// 只解構出需要用的到功能: Modal
import { Modal } from "bootstrap";

import "./assets/style.css";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // Modal 相關
  const productModalRef = useRef(null);
  const [modalMode, setModalMode] = useState(null);
  const defaultModalState = {
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imagesUrl: [""],
  };
  const [tempProduct, setTempProduct] = useState(defaultModalState);

  useEffect(() => {
    // 初始化 Modal
    // 助教寫法，跟老師在課堂上 modal 使用到兩個 ref 不太一樣 ↓
    // myModal.current = new Modal(modalRef.current);
    new Modal(productModalRef.current, {
      backdrop: false, // 點選 modal 外面時不會關閉
      keyboard: false,
    });
  }, []);

  const openProductModal = (mode, product) => {
    setModalMode(mode);

    switch (mode) {
      case "create":
        setTempProduct(defaultModalState);
        break;
      case "edit":
        setTempProduct(product);
        break;
      default:
        break;
    }

    // 助教寫法: 建立 Modal 實例
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const closeProductModal = () => {
    // 助教寫法: 建立 Modal 實例
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;
    // console.log(value, name);
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const handleImageChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];

    newImages[index] = value;

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  }

  // 產品 API 相關
  const [products, setProduct] = useState([]);
  const getProductData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      // console.log(response.data.products);
      setProduct(response.data.products);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  // 使用者登錄相關
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setisAuth] = useState(false);

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
      getProductData();
      setisAuth(true);
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

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
      getProductData();
      // 通過登入驗證
      setisAuth(true);
    } catch (error) {
      alert("登入失敗: " + error.response.data.message);
    }
  };

  // 畫面渲染
  return (
    <>
      {isAuth ? (
        <div>
          <div className="container">
            <div className="text-end mt-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  openProductModal("create");
                }}
              >
                建立新的產品
              </button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th width="120">分類</th>
                  <th>產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">是否啟用</th>
                  <th width="120">編輯</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.category}</td>
                      <td>{product.title}</td>
                      <td className="text-end">{product.origin_price}</td>
                      <td className="text-end">{product.price}</td>
                      <td>
                        {product.is_enabled ? (
                          <span className="text-success">啟用</span>
                        ) : (
                          <span>未啟用</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              openProductModal("edit", product);
                            }}
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
      <div
        id="productModal"
        className="modal fade"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 id="productModalLabel" className="modal-title fs-4">
                <span>{modalMode === "create" ? "新增產品" : "編輯產品"}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeProductModal}
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-3">
                      <label htmlFor="primary-image" className="form-label">
                        主圖
                      </label>
                      <input
                        value={tempProduct.imageUrl}
                        name="imageUrl"
                        type="url"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                        onChange={handleModalInputChange}
                      />
                    </div>
                    <img
                      className="img-fluid"
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                    />
                  </div>
                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3 mb-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          id={`imagesUrl-${index + 1}`}
                          type="url"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                          onChange={(e) => {handleImageChange(e, index)}}
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="btn-group w-100">
                    <button className="btn btn-outline-primary btn-sm w-100">
                      新增圖片
                    </button>
                    <button className="btn btn-outline-danger btn-sm w-100">
                      刪除圖片
                    </button>
                  </div>
                </div>
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                      name="title"
                      onChange={handleModalInputChange}
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">
                        分類
                      </label>
                      <input
                        value={tempProduct.category}
                        name="category"
                        id="category"
                        type="text"
                        className="form-control"
                        placeholder="請輸入分類"
                        onChange={handleModalInputChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">
                        單位
                      </label>
                      <input
                        value={tempProduct.unit}
                        name="unit"
                        id="unit"
                        type="text"
                        className="form-control"
                        placeholder="請輸入單位"
                        onChange={handleModalInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        min="0" // 初步防止使用者選擇到負值
                        className="form-control"
                        placeholder="請輸入原價"
                        onChange={handleModalInputChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        name="price"
                        id="price"
                        type="number"
                        min="0" // 初步防止使用者選擇到負值
                        className="form-control"
                        placeholder="請輸入售價"
                        onChange={handleModalInputChange}
                      />
                    </div>
                  </div>
                  <hr />

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      name="description"
                      id="description"
                      className="form-control"
                      placeholder="請輸入產品描述"
                      onChange={handleModalInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      name="content"
                      id="content"
                      className="form-control"
                      placeholder="請輸入說明內容"
                      onChange={handleModalInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        // 綁定 checkbox 的勾選狀態時，應透過 checked 屬性，而非 value
                        checked={tempProduct.is_enabled}
                        name="is_enabled"
                        id="is_enabled"
                        className="form-check-input"
                        type="checkbox"
                        onChange={handleModalInputChange}
                      />
                      <label className="form-check-label" htmlFor="is_enabled">
                        是否啟用
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
                onClick={closeProductModal}
              >
                取消
              </button>
              <button type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
