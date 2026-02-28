import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FuelRates.css";

const LIST_API = "https://tnreaders.mpdatahub.com/mobile/fuel-rates-new";
const UPDATE_API = "https://tnreaders.mpdatahub.com/mobile/fetch-fuel-rates-update";

const FuelRates = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  /* FETCH DATA */
  const fetchFuelRates = async () => {
    try {
      const res = await axios.get(LIST_API);
      if (res.data.success) {
        setCities(res.data.cities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelRates();
  }, []);

  /* EDIT HANDLER */
  const handleEdit = (row) => {
    setEditData({ ...row });
  };

  /* INPUT CHANGE */
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  /* UPDATE */
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${UPDATE_API}/${editData.id}`, {
        city_name: editData.city_name,
        state_name: editData.state_name,
        date: editData.date.split("T")[0],
        petrol: Number(editData.petrol),
        diesel: Number(editData.diesel),
        cng: Number(editData.cng),
        lpg: Number(editData.lpg),
      });

      alert("Updated successfully");
      setEditData(null);
      fetchFuelRates();
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading) return <p className="loading">Loading fuel rates...</p>;

  return (
    <div className="table-containerfl">
      <h2>Fuel Rates Table</h2>

      <div className="table-wrapperfl">
        <table>
          <thead>
            <tr>
              <th>City</th>
              <th>State</th>
              <th>Petrol (₹)</th>
              <th>Diesel (₹)</th>
              <th>CNG (₹)</th>
              <th>LPG (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id}>
                <td>{city.city_name}</td>
                <td>{city.state_name}</td>
                <td>{city.petrol}</td>
                <td>{city.diesel}</td>
                <td>{city.cng}</td>
                <td>{city.lpg}</td>
                <td>
                  <button onClick={() => handleEdit(city)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editData && (
        <div className="modalfl">
          <form className="modal-formfl" onSubmit={handleUpdate}>
            <h3>Edit Fuel Rate</h3>

            <input name="city_name" value={editData.city_name} onChange={handleChange} />
            <input name="state_name" value={editData.state_name} onChange={handleChange} />
            <input
              type="date"
              name="date"
              value={editData.date.split("T")[0]}
              onChange={handleChange}
            />

            <input name="petrol" type="number" step="0.01" value={editData.petrol} onChange={handleChange} />
            <input name="diesel" type="number" step="0.01" value={editData.diesel} onChange={handleChange} />
            <input name="cng" type="number" step="0.01" value={editData.cng} onChange={handleChange} />
            <input name="lpg" type="number" step="0.01" value={editData.lpg} onChange={handleChange} />

            <div className="modal-actionsfl">
              <button type="submit">Update</button>
              <button type="button" className="cancel" onClick={() => setEditData(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FuelRates;
