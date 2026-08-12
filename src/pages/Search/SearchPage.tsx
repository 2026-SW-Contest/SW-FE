import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import closeIcon from "../../assets/icons/actions/close.svg";
import searchIcon from "../../assets/icons/actions/search.svg";
import { getSearchSuggestions, SearchSuggestions } from "../../api/search";
import {
  addRecentSearch,
  deleteAllRecentSearches,
  deleteRecentSearch,
  getRecentSearches,
  RecentSearchItem,
} from "../../api/recentSearch";
import { useAuth } from "../../context/AuthContext";

import "./SearchPage.css";

const EMPTY_SUGGESTIONS: SearchSuggestions = {
  lostItemSuggestions: [],
  facilityRequestSuggestions: [],
};

const SearchPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState(EMPTY_SUGGESTIONS);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [deletingRecentSearchIds, setDeletingRecentSearchIds] = useState<Set<number>>(
    new Set(),
  );
  const [isDeletingAllRecentSearches, setIsDeletingAllRecentSearches] =
    useState(false);
  const keyword = searchValue.trim();

  useEffect(() => {
    if (!isAuthenticated) {
      setRecentSearches([]);
      return;
    }

    let active = true;
    void getRecentSearches()
      .then((items) => {
        if (active) setRecentSearches(items);
      })
      .catch(() => {
        if (active) setRecentSearches([]);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!keyword) {
      setSuggestions(EMPTY_SUGGESTIONS);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      void getSearchSuggestions(keyword)
        .then((response) => {
          if (active) setSuggestions(response);
        })
        .catch(() => {
          if (active) setSuggestions(EMPTY_SUGGESTIONS);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [keyword]);

  const submitSearch = (value = searchValue) => {
    const query = value.trim();
    if (!query) return;

    if (isAuthenticated) {
      void addRecentSearch(query).then(setRecentSearches).catch(() => undefined);
    }
    navigate(`/search/result?q=${encodeURIComponent(query)}`);
  };

  const handleDeleteRecentSearch = async (recentSearchId: number) => {
    if (deletingRecentSearchIds.has(recentSearchId)) return;

    const previousSearches = recentSearches;
    setDeletingRecentSearchIds((current) => new Set(current).add(recentSearchId));
    setRecentSearches((current) =>
      current.filter((item) => item.recentSearchId !== recentSearchId),
    );

    try {
      await deleteRecentSearch(recentSearchId);
    } catch {
      setRecentSearches(previousSearches);
    } finally {
      setDeletingRecentSearchIds((current) => {
        const next = new Set(current);
        next.delete(recentSearchId);
        return next;
      });
    }
  };

  const handleDeleteAllRecentSearches = async () => {
    if (isDeletingAllRecentSearches || recentSearches.length === 0) return;

    const previousSearches = recentSearches;
    setIsDeletingAllRecentSearches(true);
    setRecentSearches([]);

    try {
      await deleteAllRecentSearches();
    } catch {
      setRecentSearches(previousSearches);
    } finally {
      setIsDeletingAllRecentSearches(false);
    }
  };

  const renderSuggestionList = (items: string[], type: "lost" | "facility") =>
    items.length > 0 ? (
      <div className="search-list">
        {items.map((item) => (
          <button
            key={`${type}-${item}`}
            type="button"
            className="search-item"
            onClick={() => submitSearch(item)}
          >
            <img src={searchIcon} alt="" className="search-item-icon" />
            <span className="body06 search-item-title">{item}</span>
          </button>
        ))}
      </div>
    ) : (
      <div className="search-no-result">
        <img src={searchIcon} alt="" className="search-item-icon" />
        <span className="body06 search-empty-text">검색 내역이 없습니다</span>
      </div>
    );

  return (
    <Layout
      current="search"
      appBarVariant="search"
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearchSubmit={() => submitSearch()}
      onClearSearch={() => setSearchValue("")}
    >
      <div className="search-page">
        {!keyword ? (
          <section className="search-recent">
            <div className="search-recent-header">
              <h2 className="body01 search-title">최근 검색</h2>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  className="caption02 search-recent-delete-all"
                  disabled={isDeletingAllRecentSearches}
                  onClick={() => void handleDeleteAllRecentSearches()}
                >
                  전체 삭제
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="search-recent-chip-list">
                {recentSearches.map((item) => (
                  <div className="search-recent-chip" key={item.recentSearchId}>
                    <button
                      type="button"
                      className="body06 search-recent-keyword"
                      onClick={() => submitSearch(item.keyword)}
                    >
                      {item.keyword}
                    </button>
                    <button
                      type="button"
                      className="search-recent-delete"
                      aria-label={`${item.keyword} 최근 검색어 삭제`}
                      disabled={deletingRecentSearchIds.has(item.recentSearchId)}
                      onClick={() =>
                        void handleDeleteRecentSearch(item.recentSearchId)
                      }
                    >
                      <img src={closeIcon} alt="" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="search-empty">
                <p className="body06">최근 검색 내역이 없습니다</p>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="search-section">
              <h2 className="body01 search-section-title">분실물 검색 내역</h2>
              {renderSuggestionList(suggestions.lostItemSuggestions, "lost")}
            </section>

            <div className="search-divider" />

            <section className="search-section">
              <h2 className="body01 search-section-title">
                시설·기자재 검색 내역
              </h2>
              {renderSuggestionList(
                suggestions.facilityRequestSuggestions,
                "facility",
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
