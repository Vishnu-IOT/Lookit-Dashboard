import React, { useEffect, useState } from "react";
import "../styles/VegetablePriceList.css";

const VegetablePriceList = () => {
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editItem, setEditItem] = useState(null);

    /* FETCH LIST */
    useEffect(() => {
        fetchVegetables();
    }, []);

    const fetchVegetables = async () => {
        try {
            const res = await fetch(
                "https://tnreaders.mpdatahub.com/mobile/vegetable/list"
            );
            const data = await res.json();
            setVegetables(data.data || []);
        } catch (error) {
            console.error("Error fetching vegetables", error);
        } finally {
            setLoading(false);
        }
    };

    /* HANDLE EDIT */
    const handleEditClick = (item) => {
        setEditItem({
            id: item.id,
            vegetable: item.vegetable_en,
            price_date: item.price_date,
            min_price: item.min_price,
            max_price: item.max_price,
        });
    };

    /* HANDLE CHANGE */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditItem({ ...editItem, [name]: value });
    };

    /* UPDATE API */
    const handleUpdate = async (e) => {
        e.preventDefault();
        const upveg = JSON.stringify(editItem)

        try {
            const res = await fetch(
                "https://tnreaders.mpdatahub.com/mobile/vegetable-price/update",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: upveg,
                }
            );

            const result = await res.json();
            if (result.success) {
                alert("Price updated successfully");
                setEditItem(null);
                fetchVegetables();
            } else {
                alert("Update failed");
            }
        } catch (error) {
            console.error("Update error", error);
        }
    };

    if (loading) return <p className="loading">Loading prices...</p>;

    return (
        <div className="veg-container">
            <h2>Vegetable Price List</h2>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Vegetable</th>
                            <th>Market</th>
                            <th>Min Price</th>
                            <th>Max Price</th>
                            <th>Avg</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vegetables.map((item) => (
                            <tr key={item.id}>
                                <td>{item.vegetable_en}</td>
                                <td>{item.market}</td>
                                <td>₹{item.min_price}</td>
                                <td>₹{item.max_price}</td>
                                <td>₹{item.avg_price}</td>
                                <td>{item.price_date}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditClick(item)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* EDIT MODAL */}
            {editItem && (
                <div className="modal-overlay">
                    <form className="modal" onSubmit={handleUpdate}>
                        <h3>Edit Price</h3>

                        <label>Vegetable</label>
                        <input value={editItem.vegetable} disabled />

                        <label>Price Date</label>
                        <input
                            type="date"
                            name="price_date"
                            value={editItem.price_date}
                            onChange={handleChange}
                            required
                        />

                        <label>Min Price</label>
                        <input
                            type="number"
                            name="min_price"
                            value={editItem.min_price}
                            onChange={handleChange}
                            required
                        />

                        <label>Max Price</label>
                        <input
                            type="number"
                            name="max_price"
                            value={editItem.max_price}
                            onChange={handleChange}
                            required
                        />

                        <div className="modal-actions">
                            <button type="submit" className="save-btn">
                                Update
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setEditItem(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VegetablePriceList;
