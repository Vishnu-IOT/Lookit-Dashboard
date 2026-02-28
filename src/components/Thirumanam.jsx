import React, { useEffect, useState } from "react";
import "../styles/Thiru.css";

const Thirumanam = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [femaleStarFilter, setFemaleStarFilter] = useState("");
    const [maleStarFilter, setMaleStarFilter] = useState("");
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [allFemaleStars, setAllFemaleStars] = useState([]);
    const [allMaleStars, setAllMaleStars] = useState([]);
    const perPage = 50;

    const API_BASE = "https://lookit.mpdatahub.com/mobile/thirumana";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`${API_BASE}?per_page=${perPage}&page=${page}`);
                const json = await response.json();

                if (json.status === true) {
                    setRecords(json.data || []);

                    // Extract unique values for filters from current page
                    const femaleStars = [...new Set(json.data?.map(r => r.rasistarwomen).filter(Boolean) || [])];
                    const maleStars = [...new Set(json.data?.map(r => r.rasistarmen).filter(Boolean) || [])];

                    if (page === 1) {
                        setAllFemaleStars(femaleStars);
                        setAllMaleStars(maleStars);
                    } else {
                        setAllFemaleStars(prev => [...new Set([...prev, ...femaleStars])]);
                        setAllMaleStars(prev => [...new Set([...prev, ...maleStars])]);
                    }

                    // Pagination logic
                    if (json.total !== undefined) {
                        setTotalRecords(json.total);
                        setLastPage(Math.ceil(json.total / perPage));
                    } else if (json.pagination?.total !== undefined) {
                        setTotalRecords(json.pagination.total);
                        setLastPage(Math.ceil(json.pagination.total / perPage));
                    } else if (json.meta?.total !== undefined) {
                        setTotalRecords(json.meta.total);
                        setLastPage(Math.ceil(json.meta.total / perPage));
                    } else {
                        if (json.data?.length < perPage) {
                            setLastPage(page);
                            setTotalRecords((page - 1) * perPage + json.data.length);
                        } else {
                            setLastPage(page + 1);
                            setTotalRecords((page) * perPage);
                        }
                    }

                } else {
                    setError("API returned false status");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [page]);

    // Filtered records from current page
    const filteredRecords = records.filter(item =>
        (femaleStarFilter === "" || item.rasistarwomen === femaleStarFilter) &&
        (maleStarFilter === "" || item.rasistarmen === maleStarFilter)
    );

    if (loading && page === 1) return (
        <div className="initial-loading">
            Loading initial data...
        </div>
    );

    if (error) return (
        <div className="error-message">
            {error}
        </div>
    );

    return (
        <div className="thirumanam-container">
            {/* Header */}
            <div className="thirumanam-header">
                <h2>திருமண பொருத்தம் விவரங்கள்</h2>
            </div>

            {/* Debug Panel */}
            <div className="debug-panel">
                <strong>Debug Info:</strong> Page: {page}, Total Records: {totalRecords},
                Last Page: {lastPage}, Current Records: {records.length}
            </div>

            {/* Filters Section */}
            <div className="filters-container">
                <div className="filter-row">
                    <div className="filter-group">
                        <label htmlFor="female-star">பெண் நட்சத்திரம்</label>
                        <select
                            id="female-star"
                            className="filter-select"
                            value={femaleStarFilter}
                            onChange={(e) => {
                                setFemaleStarFilter(e.target.value);
                                setPage(1);
                            }}
                            disabled={allFemaleStars.length === 0}
                        >
                            <option value="">All ({allFemaleStars.length} options)</option>
                            {allFemaleStars.sort().map(star => (
                                <option key={star} value={star}>{star}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="male-star">ஆண் நட்சத்திரம்</label>
                        <select
                            id="male-star"
                            className="filter-select"
                            value={maleStarFilter}
                            onChange={(e) => {
                                setMaleStarFilter(e.target.value);
                                setPage(1);
                            }}
                            disabled={allMaleStars.length === 0}
                        >
                            <option value="">All ({allMaleStars.length} options)</option>
                            {allMaleStars.sort().map(star => (
                                <option key={star} value={star}>{star}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="reset-button"
                        onClick={() => {
                            setFemaleStarFilter("");
                            setMaleStarFilter("");
                            setPage(1);
                        }}
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Loading indicator for page changes */}
            {loading && page > 1 && (
                <div className="loading-indicator">
                    Loading page {page}...
                </div>
            )}

            {/* Pagination */}
            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 1 || loading}
                    onClick={() => setPage(p => p - 1)}
                >
                    Previous
                </button>

                <span className="page-info">
                    Page <b>{page}</b> of <b>{lastPage}</b>
                </span>

                <button
                    className="pagination-button"
                    disabled={page === lastPage || loading}
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </button>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <table className="data-table">
                    <thead className="table-headerthiru">
                        <tr>
                            <th>ID</th>
                            <th>பெண் ராசி</th>
                            <th>ஆண் ராசி</th>
                            <th>பெண் நட்சத்திரம்</th>
                            <th>ஆண் நட்சத்திரம்</th>
                            <th>பெண் அதிபதி</th>
                            <th>ஆண் அதிபதி</th>
                            <th>Score</th>
                            <th>Poruthams</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.rasinamewomen}</td>
                                    <td>{item.rasinamemen}</td>
                                    <td>{item.rasistarwomen}</td>
                                    <td>{item.rasistarmen}</td>
                                    <td>{item.rasiathipathiwomen}</td>
                                    <td>{item.rasiathipathimen}</td>
                                    <td>{item.poruthamScore}</td>
                                    <td>
                                        <table className="poruthams-table">
                                            <tbody>
                                                {item.poruthams && item.poruthams.map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.name}</td>
                                                        <td className={p.status === "pass" ? "status-pass" : "status-fail"}>
                                                            {p.status?.toUpperCase() || "N/A"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-records">
                                    {loading ? "Loading..." : "No records found with current filters"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination-container">
                <button
                    className="pagination-button"
                    disabled={page === 1 || loading}
                    onClick={() => setPage(p => p - 1)}
                >
                    Previous
                </button>

                <span className="page-info">
                    Page <b>{page}</b> of <b>{lastPage}</b>
                </span>

                <button
                    className="pagination-button"
                    disabled={page === lastPage || loading}
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </button>
            </div>

            {/* Records Info */}
            <div className="records-info">
                Showing <b>{filteredRecords.length}</b> of <b>{records.length}</b> records on this page
                {totalRecords > 0 && ` | Total records: ${totalRecords}`}
            </div>
        </div>
    );
};

export default Thirumanam;