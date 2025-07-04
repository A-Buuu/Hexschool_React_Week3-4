import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import * as bootstrap from "bootstrap";
// 只解構出需要用的到功能: Modal
import { Modal } from "bootstrap";

import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductPage() {
  // Modal 相關
  const delProductModalRef = useRef(null);
  const [modalMode, setModalMode] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
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
    // 初始化 "刪除 Modal"
    // 助教寫法，跟老師在課堂上 modal 使用到兩個 ref 不太一樣 ↓
    // myModal.current = new Modal(modalRef.current);
    new Modal(delProductModalRef.current, {
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

    setIsProductModalOpen(true);
  };

  const openDelProductModal = (product) => {
    // 打開刪除產品 Modal 時將點選的產品設為 tempProduct
    setTempProduct(product);

    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.show();
  };

  const closeDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();
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



  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`
      );
    } catch (error) {
      alert("刪除產品失敗");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct();
      getProductData();
      closeDelProductModal();
    } catch (error) {
      alert("刪除產品失敗");
    }
  };

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
      {/* 刪除產品 Modal */}
      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={closeDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-start">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDelProductModal}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteProduct}
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductPage;
