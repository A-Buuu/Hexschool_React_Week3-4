function Pagination({ pageInfo, handlePageChange }) {
  return (
    <div className="d-flex justify-content-center">
      <nav>
        <ul className="pagination">
          <li className={`page-item ${!pageInfo.has_pre && "disabled"}`}>
            <a
              className="page-link"
              href="#"
              onClick={() => handlePageChange(pageInfo.current_page - 1)}
            >
              上一頁
            </a>
          </li>

          {
            // 產生相對應長度的陣列
            Array.from({ length: pageInfo.total_pages }).map((_, index) => (
              <li
                className={`page-item ${
                  pageInfo.current_page === index + 1 && "active"
                }`}
                key={index}
              >
                <a
                  className="page-link"
                  href="#"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </a>
              </li>
            ))
          }

          <li className={`page-item ${!pageInfo.has_next && "disabled"}`}>
            <a
              className="page-link"
              href="#"
              onClick={() => handlePageChange(pageInfo.current_page + 1)}
            >
              下一頁
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Pagination;