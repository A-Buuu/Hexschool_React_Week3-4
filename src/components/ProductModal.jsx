import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({
  modalMode,
  tempProduct,
  setTempProduct,
  isOpen,
  setIsOpen,
  getProductData,
}) {
  const productModalRef = useRef(null);
  /* 以下助教寫法有 bug: 
     當編輯後按取消，同個商品再次點編輯，剛剛修改的內容沒有被刪掉 */
  // 不希望 temProduct 在 Modal 中被改變
  // const [tempProduct, setTempProduct] = useState(tempProduct);

  // 當 tempProduct 在外層更新時，內層的 modalData 也要更新
  // useEffect(() => {
  //   setModalData({
  //     ...tempProduct
  //   });
  //   console.log("Modal: ", tempProduct.title);
  // }, [tempProduct]);

  useEffect(() => {
    // 初始化 "產品 Modal"
    // 助教寫法，跟老師在課堂上 modal 使用到兩個 ref 不太一樣 ↓
    // myModal.current = new Modal(modalRef.current);
    new Modal(productModalRef.current, {
      backdrop: false, // 點選 modal 外面時不會關閉
      keyboard: false,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 助教寫法: 建立 Modal 實例
      const modalInstance = Modal.getInstance(productModalRef.current);
      modalInstance.show();
    }
  }, [isOpen]);

  const closeProductModal = () => {
    // 助教寫法: 建立 Modal 實例
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();

    setIsOpen(false);
  };

  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;
    // console.log(value, name);
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 產品 API 相關
  const createProduct = async () => {
    try {
      await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, {
        data: {
          ...tempProduct,
          // API 要帶的資料中 origin_price 和 price 要是 number
          origin_price: Number(tempProduct.origin_price),
          price: Number(tempProduct.price),
          // is_enabled 要存成 0 和 1, 因 tempProduct.is_enabled 存的是 checked 狀態 true or false
          is_enabled: tempProduct.is_enabled ? 1 : 0,
        },
      });
    } catch (error) {
      alert("新增產品失敗");
    }
  };

  const editProduct = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`,
        {
          data: {
            ...tempProduct,
            // API 要帶的資料中 origin_price 和 price 要是 number
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            // is_enabled 要存成 0 和 1, 因 tempProduct.is_enabled 存的是 checked 狀態 true or false
            is_enabled: tempProduct.is_enabled ? 1 : 0,
          },
        }
      );
    } catch (error) {
      alert("編輯產品失敗");
    }
  };

  const handleUpdateProduct = async () => {
    const apiCall = modalMode === "create" ? createProduct : editProduct;
    try {
      // 新增或編輯完產品才做產品列表渲染，所以要用 async/await 同步執行
      await apiCall();
      getProductData();
      // 關閉 Modal 不一定要取得產品列表完才能執行，所以不需要再 await
      closeProductModal();
    } catch (error) {
      alert("更新產品失敗");
    }
  };

  /* 副圖處理 */
  const handleImageChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];

    newImages[index] = value;

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  const handleAddImage = () => {
    // 點擊"新增圖片"時對陣列新增一個空字串
    const newImages = [...tempProduct.imagesUrl, ""];

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  const handleDeleteImage = () => {
    const newImages = [...tempProduct.imagesUrl];
    // 點擊"刪除圖片"時移除陣列中最後一個欄位
    newImages.pop();

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };

  /* 主圖圖片上傳 */
  const handleFileChange = async (e) => {
    // console.dir(e.target);
    const file = e.target.files[0];
    // 使用 FormData 格式上傳
    const formData = new FormData();
    formData.append("file-to-upload", file);
    // console.log(formData);

    try {
      const res = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData
      );
      const uploadImageUrl = res.data.imageUrl;
      // console.log(uploadImageUrl);
      setTempProduct({
        ...tempProduct,
        imageUrl: uploadImageUrl,
      });
    } catch (error) {
      // console.log(error.response.data.message.message);
      alert("檔案過大，請勿超過 3MB");
    }
    e.target.value = "";
  };

  return (
    <>
      {/* 產品 Modal */}
      <div
        id="productModal"
        className="modal fade text-start"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
      >
        <h1>{tempProduct.title}</h1>
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
                      <label htmlFor="fileInput" className="form-label">
                        {" "}
                        圖片上傳{" "}
                      </label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="form-control"
                        id="fileInput"
                        onChange={handleFileChange}
                      />
                    </div>
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
                          onChange={(e) => {
                            handleImageChange(e, index);
                          }}
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
                    {
                      // 最後一個欄位有值且未達上限(5 張)
                      tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !==
                          "" && (
                          <button
                            onClick={handleAddImage}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            新增圖片
                          </button>
                        )
                    }
                    {
                      // 當多圖陣列有值且非唯一的欄位(至少有一個 input)就顯示
                      tempProduct.imagesUrl.length > 1 && (
                        <button
                          onClick={handleDeleteImage}
                          className="btn btn-outline-danger btn-sm w-100"
                        >
                          刪除圖片
                        </button>
                      )
                    }
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
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateProduct}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductModal;
