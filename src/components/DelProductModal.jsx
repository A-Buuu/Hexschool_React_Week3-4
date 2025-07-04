import { useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function DelProductModal({ tempProduct, isOpen, setIsOpen, getProductData }) {
  const delProductModalRef = useRef(null);
  useEffect(() => {
    // 初始化 "刪除 Modal"
    // 助教寫法，跟老師在課堂上 modal 使用到兩個 ref 不太一樣 ↓
    // myModal.current = new Modal(modalRef.current);
    new Modal(delProductModalRef.current, {
      backdrop: false, // 點選 modal 外面時不會關閉
      keyboard: false,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 助教寫法: 建立 Modal 實例
      const modalInstance = Modal.getInstance(delProductModalRef.current);
      modalInstance.show();
    }
  }, [isOpen]);

  const closeDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();

    setIsOpen(false);
  };

  // 產品 API 相關
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

  return (
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
  );
}

export default DelProductModal;
