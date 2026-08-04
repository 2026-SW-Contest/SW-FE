import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import searchIcon from "../../assets/icons/appbar/search.svg";

import {
  lostListData,
  facilityListData,
} from "../../mock";

import "./SearchPage.css";

const SearchPage = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  const keyword = searchValue.trim().toLowerCase();

  const lostResult = useMemo(() => {
    if (!keyword) return [];

    return lostListData.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword) 
      );
    });
  }, [keyword]);

  const facilityResult = useMemo(() => {
    if (!keyword) return [];

    return facilityListData.filter((item) => {
      return (
        item.title.toLowerCase().includes(keyword)
      );
    });
  }, [keyword]);

  return (
      <Layout
        current="search"
        appBarVariant="search"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={() => {
          if (searchValue.trim()) {
            navigate(
              `/search/result?q=${encodeURIComponent(searchValue)}`
            );
          }
        }}
        onClearSearch={() => setSearchValue("")}
      >
      <div className="search-page">

        {!keyword ? (

          <section className="search-recent">

            <h2 className="body01 search-title">
              최근 검색
            </h2>

            <div className="search-empty">

              <p className="body06">
                최근 검색 내역이 없습니다
              </p>

            </div>

          </section>

        ) : (

          <>

            {/* 분실물 */}

            <section className="search-section">

              <h2 className="body01 search-section-title">
                분실물 검색 내역
              </h2>

              {lostResult.length > 0 ? (

                <div className="search-list">

                  {lostResult.map((item) => (

                    <button
                      key={item.id}
                      className="search-item"
                      onClick={() =>
                        navigate(`/lost/${item.id}`)
                      }
                    >
                      <img
                        src={searchIcon}
                        alt=""
                        className="search-item-icon"
                      />

                      <span className="body06 search-item-title">
                        {item.title}
                      </span>

                    </button>

                  ))}

                </div>

              ) : (

                <div className="search-no-result">

                  <img
                    src={searchIcon}
                    alt=""
                    className="search-item-icon"
                  />

                  <span className="body06 search-empty-text">
                    검색 내역이 없습니다
                  </span>

                </div>

              )}

            </section>

            <div className="search-divider" />

            {/* 시설 */}

            <section className="search-section">

              <h2 className="body01 search-section-title">
                시설·기자재 검색 내역
              </h2>

              {facilityResult.length > 0 ? (

                <div className="search-list">

                  {facilityResult.map((item) => (

                    <button
                      key={item.id}
                      className="search-item"
                    >
                      <img
                        src={searchIcon}
                        alt=""
                        className="search-item-icon"
                      />

                      <span className="body06 search-item-title">
                        {item.title}
                      </span>

                    </button>

                  ))}

                </div>

              ) : (

                <div className="search-no-result">

                  <img
                    src={searchIcon}
                    alt=""
                    className="search-item-icon"
                  />

                  <span className="body06 search-empty-text">
                    검색 내역이 없습니다
                  </span>

                </div>

              )}

            </section>

          </>

        )}

      </div>

    </Layout>
  );
};

export default SearchPage;