import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import * as bootstrap from "bootstrap";
// 只解構出需要用的到功能: Modal
import { Modal } from "bootstrap";

import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";
import DelProductModal from "../components/DelProductModal";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductPage() {
  // Modal 相關

  const [modalMode, setModalMode] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDelProductModalOpen, setIsDelProductModalOpen] = useState(false);
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

    setIsProductModalOpen(true);
  };

  const openDelProductModal = (product) => {
    // 打開刪除產品 Modal 時將點選的產品設為 tempProduct
    setTempProduct(product);
    
    setIsDelProductModalOpen(true);
  };

  // 產品 API 相關
  const [products, setProduct] = useState([]);
  const getProductData = async (page = 1) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      ); // query 寫法: ? + 參數
      // console.log("getProductData", response);
      setProduct(response.data.products);
      setPageInfo(response.data.pagination);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  useEffect(() => {
    getProductData();
  }, []);

  // 頁面處理
  const [pageInfo, setPageInfo] = useState({});
  const handlePageChange = (page) => {
    // e.preventDefault();
    // console.log("頁面: ", page);
    getProductData(page);
  };

  return (
    <>
      <div>
        <div className="container">
          <div className="d-flex justify-content-between mt-4">
            <h2 className="fw-bolder">產品列表</h2>
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
                <th width="200" className="text-start">
                  產品名稱
                </th>
                <th width="120">分類</th>
                <th width="100">原價</th>
                <th width="100">售價</th>
                <th width="100">是否啟用</th>
                <th width="120"></th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <th className="text-start">{product.title}</th>
                    <td>{product.category}</td>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
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
                          onClick={() => {
                            openDelProductModal(product);
                          }}
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
          <Pagination handlePageChange={handlePageChange} pageInfo={pageInfo} />
        </div>
      </div>
      <ProductModal
        modalMode={modalMode}
        tempProduct={tempProduct}
        setTempProduct={setTempProduct}
        isOpen={isProductModalOpen}
        setIsOpen={setIsProductModalOpen}
        getProductData={getProductData}
      />
      <DelProductModal
        tempProduct={tempProduct}
        isOpen={isDelProductModalOpen}
        setIsOpen={setIsDelProductModalOpen}
        getProductData={getProductData}
      />
    </>
  );
}

export default ProductPage;
