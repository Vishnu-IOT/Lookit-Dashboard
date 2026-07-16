import React, { useState, useEffect, useCallback, useMemo } from 'react';
import "../styles/RasiAllList.css"
import "../styles/RasiDailyList.css"
import Loder from './Loder';

const RasiAllList = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredRasi, setFilteredRasi] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [showCalendar, setShowCalendar] = useState(false);
    const [yearlyData, setYearlyData] = useState([]);
    const [kiraganamRows, setKiraganamRows] = useState([{}]);
    const [kiraganamEyeRows, setKiraganamEyeRows] = useState([{}]);
    const [editingRasi, setEditingRasi] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editMode, setEditMode] = useState('daily');
    const [editForm, setEditForm] = useState({
        id: '',
        date: '',
        duration: '',
        rasiId: '',
        rasiId: '',
        rasi: '',
        name: '',
        summary: '',
        luckyNumbers: '',
        lucky_dr: '',
        lucky_color: '',
        kiraganam: '',
        kiraganam_eye: '',
        weekly_kiraganam: '',
        advantages: '',
        prayers: '',
        image: null,
        mon_lan: 'tamil',
        rasi_des: '',
        Officers: '',
        Traders: '',
        Pengal: '',
        politician: '',
        artist: '',
        students: '',
        Good: '',
        Attention: '',
        Police: '',
        Note: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState({});

    const [localShowCalendar, setLocalShowCalendar] = useState(false);
    const [weekStart, setWeekStart] = useState(0);
    const [weekAnchorDate, setWeekAnchorDate] = useState(() => new Date());
    const [expandedItems, setExpandedItems] = useState({});
    const [expandedMonItems, setExpandedMonItems] = useState({});
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
    const [selectedYearIndex, setSelectedYearIndex] = useState(0);

    const toggleReadMore = (id) => {
        setExpandedItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const toggleMonReadMore = (id) => {
        setExpandedMonItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    useEffect(() => {
        if (selectedDate) {
            setWeekAnchorDate(new Date(selectedDate));
        }
    }, [selectedDate]);

    const API_ENDPOINTS = {
        daily: 'https://users.mpdatahub.com/api/rasi-daily-list',
        weekly: 'https://users.mpdatahub.com/api/listWeekly',
        monthly: 'https://users.mpdatahub.com/api/listemonthly',
        yearly: 'https://users.mpdatahub.com/api/listyearly'
    };
    const UPDATE_API_ENDPOINTS = {
        daily: 'https://users.mpdatahub.com/api/rasi-daily-update',
        weekly: 'https://users.mpdatahub.com/api/weekly/update',
        monthly: 'https://users.mpdatahub.com/api/update/monthly',
        yearly: 'https://users.mpdatahub.com/api/yearly/update'
    };
    const rasiData = {
        "1": { name: "மேஷம்", color: "#FF6B6B", emoji: "🐏" },
        "2": { name: "ரிஷபம்", color: "#4ECDC4", emoji: "🐂" },
        "3": { name: "மிதுனம்", color: "#45B7D1", emoji: "👫" },
        "4": { name: "கடகம்", color: "#96CEB4", emoji: "🦀" },
        "5": { name: "சிம்மம்", color: "#FFEAA7", emoji: "🦁" },
        "6": { name: "கன்னி", color: "#DDA0DD", emoji: "👸" },
        "7": { name: "துலாம்", color: "#98D8C8", emoji: "⚖️" },
        "8": { name: "விருச்சிகம்", color: "#F7DC6F", emoji: "🦂" },
        "9": { name: "தனுசு", color: "#BB8FCE", emoji: "🏹" },
        "10": { name: "மகரம்", color: "#85C1E9", emoji: "🐊" },
        "11": { name: "கும்பம்", color: "#82E0AA", emoji: "🏺" },
        "12": { name: "மீனம்", color: "#F8C471", emoji: "🐟" }
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ta-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const formatDate1 = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_ENDPOINTS[activeTab]);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (activeTab === 'daily') {
                const processedData = data || [];
                setDailyData(processedData);
                const today = getTodayDate();
                const dateExists = processedData.some(item => item.date === today);
                if (dateExists) {
                    setSelectedDate(today);
                } else if (processedData.length > 0) {
                    setSelectedDate(processedData[0]?.date || null);
                }
            } else if (activeTab === 'weekly') {
                setWeeklyData(data?.data || []);
                setSelectedWeekIndex(0);
            } else if (activeTab === 'monthly') {
                setMonthlyData(data?.data || []);
                setSelectedMonthIndex(0);
            }
            else if (activeTab === 'yearly') {
                setYearlyData(data?.data || []);
                setSelectedYearIndex(0);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);
    useEffect(() => {
        fetchData();
    }, [activeTab, fetchData]);
    useEffect(() => {
        if (activeTab === 'daily' && dailyData.length > 0) {
            let result = [...dailyData];
            result.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return sortOrder === 'desc'
                    ? dateB.getTime() - dateA.getTime()
                    : dateA.getTime() - dateB.getTime();
            });
            setFilteredRasi(result);
        }
    }, [dailyData, activeTab, sortOrder]);
    const getKiraganamHeaders = () => {
        if (kiraganamRows.length === 0) return [];
        return Object.keys(kiraganamRows[0]);
    };
    const getKiraganamEyeHeaders = () => {
        if (kiraganamEyeRows.length === 0) return [];
        return Object.keys(kiraganamEyeRows[0]);
    };
    const addKiraganamRow = () => {
        const newRow = {};
        getKiraganamHeaders().forEach(header => {
            newRow[header] = '';
        });
        setKiraganamRows([...kiraganamRows, newRow]);
    };
    const addKiraganamEyeRow = () => {
        const newRow = {};
        getKiraganamEyeHeaders().forEach(header => {
            newRow[header] = '';
        });
        setKiraganamEyeRows([...kiraganamEyeRows, newRow]);
    };
    const removeKiraganamRow = (index) => {
        const newRows = [...kiraganamRows];
        newRows.splice(index, 1);
        setKiraganamRows(newRows);
    };
    const removeKiraganamEyeRow = (index) => {
        const newRows = [...kiraganamEyeRows];
        newRows.splice(index, 1);
        setKiraganamEyeRows(newRows);
    };
    const handleKiraganamChange = (rowIndex, header, value) => {
        const newRows = [...kiraganamRows];
        newRows[rowIndex] = {
            ...newRows[rowIndex],
            [header]: value
        };
        setKiraganamRows(newRows);
    };
    const handleKiraganamEyeChange = (rowIndex, header, value) => {
        const newRows = [...kiraganamEyeRows];
        newRows[rowIndex] = {
            ...newRows[rowIndex],
            [header]: value
        };
        setKiraganamEyeRows(newRows);
    };
    const handleEditClick = (rasi, mode, parentData = null, id = null) => {
        setEditMode(mode);
        setEditingRasi(rasi);
        setIsEditing(true);
        let recordId = id;
        if (!recordId) {
            switch (mode) {
                case 'daily':
                    recordId = parentData?.id || rasi.id;
                    break;
                case 'weekly':
                    recordId = rasi.id || parentData?.id;
                    break;
                case 'monthly':
                    recordId = parentData?.id || rasi.id;
                    break;
                case 'yearly':
                    recordId = rasi.id || parentData?.id;
                    break;
            }
        }
        let formData = {
            id: recordId || '',
            date: '',
            duration: '',
            rasiId: '',
            name: '',
            summary: '',
            luckyNumbers: '',
            lucky_dr: '',
            lucky_color: '',
            kiraganam: '',
            kiraganam_eye: '',
            weekly_kiraganam: '',
            advantages: '',
            prayers: '',
            image: null,
            mon_lan: 'tamil',
            rasi_des: '',
            Officers: '',
            Traders: '',
            Pengal: '',
            politician: '',
            artist: '',
            students: '',
            Good: '',
            Attention: '',
            Police: '',
            Note: ''
        };
        const rasiValue = rasi.rasiId || rasi.rasi || '';
        formData.rasi = rasiValue;
        formData.rasiId = rasiValue;
        formData.name = rasi.name || '';
        if (rasi.imageUrl) {
            setImagePreview(rasi.imageUrl);
        } else {
            setImagePreview('');
        }
        switch (mode) {
            case 'daily':
                formData.date = parentData?.date || parentData || '';
                formData.duration = 'Daily';
                formData.summary = rasi.summary || '';
                formData.luckyNumbers = rasi.luckyNumbers || '';
                formData.lucky_dr = rasi.lucky_dr || '';
                formData.lucky_color = rasi.lucky_color || '';
                formData.prayers = rasi.prayers || '';
                break;
            case 'weekly':
                formData.date = parentData?.date || '';
                formData.kiraganam = rasi.kiraganam || '';
                formData.weekly_kiraganam = rasi.weekly_kiraganam || '';
                formData.advantages = rasi.advantages || '';
                formData.prayers = rasi.prayers || '';
                break;
            case 'monthly':
                formData.date = parentData?.date || '';
                formData.mon_lan = parentData?.mon_lan || 'tamil';
                formData.kiraganam = rasi.kiraganam || '';
                formData.prayers = rasi.prayers || '';
                break;
            case 'yearly':
                formData.date = parentData?.date || '';
                formData.mon_lan = parentData?.mon_lan || 'tamil';
                formData.kiraganam = rasi.kiraganam || '';
                formData.kiraganam_eye = rasi.kiraganam_eye || '';
                formData.rasi_des = rasi.rasi_des || '';
                formData.advantages = rasi.advantages || '';
                formData.Officers = rasi.Officers || '';
                formData.Traders = rasi.Traders || '';
                formData.Pengal = rasi.Pengal || '';
                formData.politician = rasi.politician || '';
                formData.artist = rasi.artist || '';
                formData.students = rasi.students || '';
                formData.Good = rasi.Good || '';
                formData.Attention = rasi.Attention || '';
                formData.Police = rasi.Police || '';
                formData.Note = rasi.Note || '';
                formData.prayers = rasi.prayers || '';
                if (rasi.kiraganam && typeof rasi.kiraganam === 'object') {
                    try {
                        const kiraganamData = Array.isArray(rasi.kiraganam) ? rasi.kiraganam : [rasi.kiraganam];
                        setKiraganamRows(kiraganamData);
                    } catch (error) {
                        console.error('Error parsing kiraganam data:', error);
                        setKiraganamRows([{}]);
                    }
                } else {
                    setKiraganamRows([{}]);
                }
                if (rasi.kiraganam_eye && typeof rasi.kiraganam_eye === 'object') {
                    try {
                        const eyeData = Array.isArray(rasi.kiraganam_eye) ? rasi.kiraganam_eye : [rasi.kiraganam_eye];
                        setKiraganamEyeRows(eyeData);
                    } catch (error) {
                        console.error('Error parsing kiraganam_eye data:', error);
                        setKiraganamEyeRows([{}]);
                    }
                } else {
                    setKiraganamEyeRows([{}]);
                }
                break;
        }
        setEditForm(formData);
    };
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setEditForm(prev => ({
                ...prev,
                image: file
            }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            switch (editMode) {
                case 'daily':
                    formData.append('date', editForm.date);
                    formData.append('duration', 'Daily');
                    formData.append('rasiId', editForm.rasiId || editForm.rasi);
                    formData.append('name', editForm.name);
                    formData.append('summary', editForm.summary);
                    formData.append('luckyNumbers', editForm.luckyNumbers);
                    formData.append('lucky_dr', editForm.lucky_dr);
                    formData.append('lucky_color', editForm.lucky_color);
                    if (editForm.id) formData.append('id', editForm.id);
                    break;
                case 'weekly':
                    formData.append('date', editForm.date);
                    formData.append('rasiId', editForm.rasiId || editForm.rasiId);
                    formData.append('name', editForm.name);
                    formData.append('kiraganam', editForm.kiraganam);
                    formData.append('weekly_kiraganam', editForm.weekly_kiraganam);
                    formData.append('advantages', editForm.advantages);
                    formData.append('prayers', editForm.prayers);
                    if (editForm.id) formData.append('id', editForm.id);
                    break;
                case 'monthly':
                    formData.append('date', editForm.date);
                    formData.append('rasiId', editForm.rasi || editForm.rasiId);
                    formData.append('name', editForm.name);
                    formData.append('kiraganam', editForm.kiraganam);
                    formData.append('prayers', editForm.prayers);
                    formData.append('mon_lan', editForm.mon_lan);
                    if (editForm.id) formData.append('id', editForm.id);
                    break;
                case 'yearly':
                    formData.append('date', editForm.date);
                    formData.append('rasiId', editForm.rasi || editForm.rasiId);
                    formData.append('name', editForm.name);
                    formData.append('kiraganam', JSON.stringify(kiraganamRows));
                    formData.append('kiraganam_eye', JSON.stringify(kiraganamEyeRows));
                    formData.append('prayers', editForm.prayers);
                    formData.append('mon_lan', editForm.mon_lan);
                    if (editForm.id) formData.append('id', editForm.id);
                    if (editForm.mon_lan === 'tamil') {
                        formData.append('advantages', editForm.advantages);
                        formData.append('Traders', editForm.Traders);
                        formData.append('Officers', editForm.Officers);
                        formData.append('Police', editForm.Police);
                        formData.append('politician', editForm.politician);
                        formData.append('Pengal', editForm.Pengal);
                        formData.append('students', editForm.students);
                        formData.append('Good', editForm.Good);
                        formData.append('Attention', editForm.Attention);
                        formData.append('Note', editForm.Note);
                    } else {
                        formData.append('rasi_des', editForm.rasi_des);
                        formData.append('advantages', editForm.advantages);
                        formData.append('Officers', editForm.Officers);
                        formData.append('Traders', editForm.Traders);
                        formData.append('Pengal', editForm.Pengal);
                        formData.append('politician', editForm.politician);
                        formData.append('artist', editForm.artist);
                        formData.append('students', editForm.students);
                        formData.append('Good', editForm.Good);
                        formData.append('Attention', editForm.Attention);
                    }
                    break;
            }
            if (editForm.image) {
                formData.append('image', editForm.image);
            }
            // for (let pair of formData.entries()) {
            //     console.log(pair[0] + ': ' + pair[1]);
            // }
            const apiUrl = UPDATE_API_ENDPOINTS[editMode];
            const method = 'POST';
            const response = await fetch(apiUrl, {
                method: method,
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message || 'Rasi updated successfully!');
                setIsEditing(false);
                setEditingRasi(null);
                fetchData();
            } else {
                alert(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert(`Failed to update Rasi: ${error.message}`);
        }
    };
    const handleStatusToggle = async (date, currentStatus) => {
        if (!date) return;
        const newStatus = currentStatus === 'allow' ? 'disallow' : 'allow';
        const confirmMessage = `Are you sure you want to ${newStatus === 'allow' ? 'enable' : 'disable'} predictions for ${formatDate(date)}?`;
        if (!window.confirm(confirmMessage)) {
            return;
        }
        const statusId = isUpdatingStatus[date];
        if (statusId) {
            clearTimeout(statusId);
        }
        // Optimistic update
        const updatedDailyData = dailyData.map(item => {
            if (item.date === date) {
                return { ...item, status: newStatus };
            }
            return item;
        });
        setDailyData(updatedDailyData);
        setIsUpdatingStatus(prev => ({
            ...prev,
            [date]: setTimeout(() => {
                setIsUpdatingStatus(prev => {
                    const newState = { ...prev };
                    delete newState[date];
                    return newState;
                });
            }, 2000)
        }));
        try {
            const response = await fetch(
                `https://users.mpdatahub.com/api/rasi-daily-status?date=${date}&status=${newStatus}`,
                { method: 'GET' }
            );
            if (!response.ok) {
                throw new Error('Status update failed');
            }
            const result = await response.json();
            if (!result.success) {
                // Revert on failure
                const revertedData = dailyData.map(item => {
                    if (item.date === date) {
                        return { ...item, status: currentStatus };
                    }
                    return item;
                });
                setDailyData(revertedData);
                alert('Failed to update status');
            } else {
                alert(`Status updated to ${newStatus === 'allow' ? 'Enabled' : 'Disabled'}`);
            }
        } catch (error) {
            console.error('Status toggle error:', error);
            const revertedData = dailyData.map(item => {
                if (item.date === date) {
                    return { ...item, status: currentStatus };
                }
                return item;
            });
            setDailyData(revertedData);
            alert('Failed to update status');
        }
    };
    // Cancel edit
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingRasi(null);
        setEditForm({
            id: '',
            date: '',
            duration: '',
            rasiId: '',
            name: '',
            summary: '',
            luckyNumbers: '',
            lucky_dr: '',
            lucky_color: '',
            kiraganam: '',
            kiraganam_eye: '',
            weekly_kiraganam: '',
            advantages: '',
            prayers: '',
            image: null,
            mon_lan: 'tamil',
            rasi_des: '',
            Officers: '',
            Traders: '',
            Pengal: '',
            politician: '',
            artist: '',
            students: '',
            Good: '',
            Attention: '',
            Police: '',
            Note: ''
        });
        setImagePreview('');
    };
    const getMonthlyRasiId = (rasi) => {
        return rasi.rasiId || rasi.rasi || '';
    };
    const getYearlyRasiId = (rasi) => {
        return rasi?.rasiId || rasi?.rasi || '';
    };
    const renderComplexValue = (value) => {
        if (!value) return '—';
        if (Array.isArray(value)) {
            if (!value.length) return '—';
            return value.map((obj, i) => (
                <div key={i} className="kv-row">
                    {Object.entries(obj).map(([k, v]) => (
                        <div key={k}>
                            <strong>{k}:</strong> {v}
                        </div>
                    ))}
                </div>
            ));
        }
        return value;
    };
    // Render Edit Form Modal
    const renderEditModal = () => {
        const getModalTitle = () => {
            switch (editMode) {
                case 'daily': return '✏️ Edit Daily Rasi Prediction';
                case 'weekly': return '✏️ Edit Weekly Rasi Prediction';
                case 'monthly': return '✏️ Edit Monthly Rasi Prediction';
                case 'yearly': return '✏️ Edit Yearly Rasi Prediction';
                default: return '✏️ Edit Rasi Prediction';
            }
        };
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>{getModalTitle()}</h3>
                        <button className="close-btn" onClick={handleCancelEdit}>×</button>
                    </div>
                    <form onSubmit={handleUpdateSubmit} className="edit-form">
                        {/* Common Fields */}
                        <div className="form-group">
                            <label>Select Rasi:</label>
                            <select
                                name="rasiId"
                                value={editForm.rasiId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setEditForm(prev => ({
                                        ...prev,
                                        rasiId: value,
                                        rasiId: value
                                    }));
                                }}
                                className="form-input"
                                required
                            >
                                <option value="">Select Rasi</option>
                                {Object.entries(rasiData).map(([id, data]) => (
                                    <option key={id} value={id}>
                                        {data.emoji} {data.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Rasi Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="Enter Rasi name"
                                required
                            />
                        </div>
                        {/* Daily Specific Fields */}
                        {editMode === 'daily' && (
                            <>
                                <div className="form-group">
                                    <label>Summary:</label>
                                    <textarea
                                        name="summary"
                                        value={editForm.summary}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Enter prediction summary"
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>🎲 Lucky Numbers:</label>
                                        <input
                                            type="text"
                                            name="luckyNumbers"
                                            value={editForm.luckyNumbers}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., 5, 12, 24"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>🎨 Lucky Color:</label>
                                        <input
                                            type="text"
                                            name="lucky_color"
                                            value={editForm.lucky_color}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g., சிவப்பு"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>🧭 Lucky Direction:</label>
                                    <input
                                        type="text"
                                        name="lucky_dr"
                                        value={editForm.lucky_dr}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g., வடக்கு"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🙏 பிரார்த்தனைகள்:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter பிரார்த்தனைகள்"
                                    />
                                </div>
                            </>
                        )}
                        {/* Weekly Specific Fields */}
                        {editMode === 'weekly' && (
                            <>
                                <div className="form-group">
                                    <label>🌟 கிரகணம்:</label>
                                    <textarea
                                        name="kiraganam"
                                        value={editForm.kiraganam}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter கிரகணம்"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>📈 வாராந்திர கிரகணம்:</label>
                                    <textarea
                                        name="weekly_kiraganam"
                                        value={editForm.weekly_kiraganam}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter வாராந்திர கிரகணம்"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>👍 நன்மைகள்:</label>
                                    <textarea
                                        name="advantages"
                                        value={editForm.advantages}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter நன்மைகள்"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>🙏 பிரார்த்தனைகள்:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter பிரார்த்தனைகள்"
                                    />
                                </div>
                            </>
                        )}
                        {/* Monthly Specific Fields */}
                        {editMode === 'monthly' && (
                            <>
                                <div className="form-group">
                                    <label>🌟 கிரகணம்:</label>
                                    <textarea
                                        name="kiraganam"
                                        value={editForm.kiraganam}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="4"
                                        placeholder="Enter கிரகணம்"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Language:</label>
                                    <select
                                        name="mon_lan"
                                        value={editForm.mon_lan}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    >
                                        <option value="tamil">தமிழ்</option>
                                        <option value="english">English</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>🙏 பிரார்த்தனைகள்:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter பிரார்த்தனைகள்"
                                    />
                                </div>
                            </>
                        )}
                        {/* Yearly Specific Fields */}
                        {editMode === 'yearly' && (
                            <>

                                <div className="form-group">
                                    <label>Language:</label>
                                    <select
                                        name="mon_lan"
                                        value={editForm.mon_lan}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    >
                                        <option value="tamil">தமிழ்</option>
                                        <option value="english">English</option>
                                    </select>
                                </div>
                                {/* Dynamic Kiraganam Table */}
                                <div className="form-group">
                                    <label>🌟 Kiraganam Data:</label>
                                    <div className="dynamic-table-container">
                                        <div className="table-header">
                                            <h4>Kiraganam Table</h4>
                                            <button
                                                type="button"
                                                className="btn-add-row"
                                                onClick={addKiraganamRow}
                                            >
                                                + Add Row
                                            </button>
                                        </div>
                                        <div className="table-wrapper">
                                            <table className="dynamic-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        {getKiraganamHeaders().map((header, idx) => (
                                                            <th key={idx}>
                                                                <input
                                                                    type="text"
                                                                    className="table-header-input"
                                                                    placeholder="Column name"
                                                                    value={header}
                                                                    onChange={(e) => {
                                                                        const newRows = [...kiraganamRows];
                                                                        const oldHeader = header;
                                                                        newRows.forEach(row => {
                                                                            if (row[oldHeader] !== undefined) {
                                                                                row[e.target.value] = row[oldHeader];
                                                                                delete row[oldHeader];
                                                                            }
                                                                        });
                                                                        setKiraganamRows(newRows);
                                                                    }}
                                                                />
                                                            </th>
                                                        ))}
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {kiraganamRows.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            <td>{rowIndex + 1}</td>
                                                            {getKiraganamHeaders().map((header, colIndex) => (
                                                                <td key={colIndex}>
                                                                    <input
                                                                        type="text"
                                                                        className="table-cell-input"
                                                                        placeholder="Enter value"
                                                                        value={row[header] || ''}
                                                                        onChange={(e) => handleKiraganamChange(rowIndex, header, e.target.value)}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn-remove-row"
                                                                    onClick={() => removeKiraganamRow(rowIndex)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="table-controls">
                                            <button
                                                type="button"
                                                className="btn-add-column"
                                                onClick={() => {
                                                    const newHeaders = [...getKiraganamHeaders(), `field_${Date.now()}`];
                                                    const newRows = kiraganamRows.map(row => ({
                                                        ...row,
                                                        [newHeaders[newHeaders.length - 1]]: ''
                                                    }));
                                                    setKiraganamRows(newRows);
                                                }}
                                            >
                                                + Add Column
                                            </button>
                                            {getKiraganamHeaders().length > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-column"
                                                    onClick={() => {
                                                        const headers = getKiraganamHeaders();
                                                        if (headers.length > 0) {
                                                            const lastHeader = headers[headers.length - 1];
                                                            const newRows = kiraganamRows.map(row => {
                                                                const newRow = { ...row };
                                                                delete newRow[lastHeader];
                                                                return newRow;
                                                            });
                                                            setKiraganamRows(newRows);
                                                        }
                                                    }}
                                                >
                                                    - Remove Last Column
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Dynamic Kiraganam Eye Table */}
                                <div className="form-group">
                                    <label>👁️ Kiraganam Eye Data:</label>
                                    <div className="dynamic-table-container">
                                        <div className="table-header">
                                            <h4>Kiraganam Eye Table</h4>
                                            <button
                                                type="button"
                                                className="btn-add-row"
                                                onClick={addKiraganamEyeRow}
                                            >
                                                + Add Row
                                            </button>
                                        </div>
                                        <div className="table-wrapper">
                                            <table className="dynamic-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        {getKiraganamEyeHeaders().map((header, idx) => (
                                                            <th key={idx}>
                                                                <input
                                                                    type="text"
                                                                    className="table-header-input"
                                                                    placeholder="Column name"
                                                                    value={header}
                                                                    onChange={(e) => {
                                                                        const newRows = [...kiraganamEyeRows];
                                                                        const oldHeader = header;
                                                                        newRows.forEach(row => {
                                                                            if (row[oldHeader] !== undefined) {
                                                                                row[e.target.value] = row[oldHeader];
                                                                                delete row[oldHeader];
                                                                            }
                                                                        });
                                                                        setKiraganamEyeRows(newRows);
                                                                    }}
                                                                />
                                                            </th>
                                                        ))}
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {kiraganamEyeRows.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            <td>{rowIndex + 1}</td>
                                                            {getKiraganamEyeHeaders().map((header, colIndex) => (
                                                                <td key={colIndex}>
                                                                    <input
                                                                        type="text"
                                                                        className="table-cell-input"
                                                                        placeholder="Enter value"
                                                                        value={row[header] || ''}
                                                                        onChange={(e) => handleKiraganamEyeChange(rowIndex, header, e.target.value)}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn-remove-row"
                                                                    onClick={() => removeKiraganamEyeRow(rowIndex)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="table-controls">
                                            <button
                                                type="button"
                                                className="btn-add-column"
                                                onClick={() => {
                                                    const newHeaders = [...getKiraganamEyeHeaders(), `field_${Date.now()}`];
                                                    const newRows = kiraganamEyeRows.map(row => ({
                                                        ...row,
                                                        [newHeaders[newHeaders.length - 1]]: ''
                                                    }));
                                                    setKiraganamEyeRows(newRows);
                                                }}
                                            >
                                                + Add Column
                                            </button>
                                            {getKiraganamEyeHeaders().length > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-column"
                                                    onClick={() => {
                                                        const headers = getKiraganamEyeHeaders();
                                                        if (headers.length > 0) {
                                                            const lastHeader = headers[headers.length - 1];
                                                            const newRows = kiraganamEyeRows.map(row => {
                                                                const newRow = { ...row };
                                                                delete newRow[lastHeader];
                                                                return newRow;
                                                            });
                                                            setKiraganamEyeRows(newRows);
                                                        }
                                                    }}
                                                >
                                                    - Remove Last Column
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Rest of the yearly fields based on language */}
                                {editForm.mon_lan === 'tamil' ? (
                                    <>
                                        <div className="form-group">
                                            <label>👍 நன்மைகள்:</label>
                                            <textarea
                                                name="advantages"
                                                value={editForm.advantages}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="2"
                                                placeholder="Enter நன்மைகள்"
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>🏪 வியாபாரிகள்:</label>
                                                <textarea
                                                    name="Traders"
                                                    value={editForm.Traders}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter வியாபாரிகள்"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>👮 அதிகாரிகள்:</label>
                                                <textarea
                                                    name="Officers"
                                                    value={editForm.Officers}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter அதிகாரிகள்"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👮‍♀️ காவல்துறை:</label>
                                                <textarea
                                                    name="Police"
                                                    value={editForm.Police}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter காவல்துறை"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>🏛️ அரசியல்வாதிகள்:</label>
                                                <textarea
                                                    name="politician"
                                                    value={editForm.politician}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter அரசியல்வாதிகள்"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👩 பெண்கள்:</label>
                                                <textarea
                                                    name="Pengal"
                                                    value={editForm.Pengal}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter பெண்கள்"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>🎓 மாணவர்கள்:</label>
                                                <textarea
                                                    name="students"
                                                    value={editForm.students}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter மாணவர்கள்"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👍 நல்லது:</label>
                                                <textarea
                                                    name="Good"
                                                    value={editForm.Good}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter நல்லது"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>⚠️ கவனம்:</label>
                                                <textarea
                                                    name="Attention"
                                                    value={editForm.Attention}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter கவனம்"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>📝 குறிப்பு:</label>
                                            <textarea
                                                name="Note"
                                                value={editForm.Note}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="2"
                                                placeholder="Enter குறிப்பு"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>📜 Rasi Description:</label>
                                            <textarea
                                                name="rasi_des"
                                                value={editForm.rasi_des}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="3"
                                                placeholder="Enter Rasi Description"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>👍 Advantages:</label>
                                            <textarea
                                                name="advantages"
                                                value={editForm.advantages}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                rows="2"
                                                placeholder="Enter Advantages"
                                            />
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👮 Officers:</label>
                                                <textarea
                                                    name="Officers"
                                                    value={editForm.Officers}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Officers"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>🏪 Traders:</label>
                                                <textarea
                                                    name="Traders"
                                                    value={editForm.Traders}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Traders"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👩 Pengal:</label>
                                                <textarea
                                                    name="Pengal"
                                                    value={editForm.Pengal}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Pengal"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>🏛️ Politician:</label>
                                                <textarea
                                                    name="politician"
                                                    value={editForm.politician}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Politician"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>🎨 Artist:</label>
                                                <textarea
                                                    name="artist"
                                                    value={editForm.artist}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Artist"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>🎓 Students:</label>
                                                <textarea
                                                    name="students"
                                                    value={editForm.students}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter for Students"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>👍 Good:</label>
                                                <textarea
                                                    name="Good"
                                                    value={editForm.Good}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter Good"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>⚠️ Attention:</label>
                                                <textarea
                                                    name="Attention"
                                                    value={editForm.Attention}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    rows="2"
                                                    placeholder="Enter Attention"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label>🙏 Prayers:</label>
                                    <textarea
                                        name="prayers"
                                        value={editForm.prayers}
                                        onChange={handleInputChange}
                                        className="form-textarea"
                                        rows="3"
                                        placeholder="Enter Prayers"
                                    />
                                </div>
                            </>
                        )}
                        {/* Image Upload for all */}
                        <div className="form-group">
                            <label>🖼️ Image:</label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleInputChange}
                                className="form-input"
                                accept="image/*"
                            />
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
                                </div>
                            )}
                        </div>
                        <div className="form-buttons">
                            <button type="submit" className="btn btn-primary">
                                Update Rasi
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    const renderDailyContent = () => {
        // Local fallback so the "Pick Date" panel still works even if the
        // parent hasn't wired up showCalendar/setShowCalendar as props.

        const isCalendarOpen = typeof showCalendar === 'boolean' ? showCalendar : localShowCalendar;
        const toggleCalendar = () =>
            (setShowCalendar || setLocalShowCalendar)(!isCalendarOpen);

        // Purely presentational: which 7-day window of the strip is visible.

        if (!dailyData.length) {
            return <div className="daily-list-no-data">No daily data available</div>;
        }

        const groupedByDate = dailyData.reduce((acc, item) => {
            acc[item.date] = item;
            return acc;
        }, {});

        const toISODate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const getMondayOfWeek = (date) => {
            const d = new Date(date);
            const dow = d.getDay(); // 0=Sun..6=Sat
            const diff = (dow === 0 ? -6 : 1) - dow;
            d.setDate(d.getDate() + diff);
            d.setHours(0, 0, 0, 0);
            return d;
        };

        // Build Mon–Sun purely from the calendar, not from fetched-data indices
        const monday = getMondayOfWeek(weekAnchorDate);
        const weekWindow = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const iso = toISODate(d);
            return groupedByDate[iso] || { date: iso, status: null, data: [] };
        });

        const goPrevWeek = () => {
            const d = new Date(weekAnchorDate);
            d.setDate(d.getDate() - 7);
            setWeekAnchorDate(d);
        };
        const goNextWeek = () => {
            const d = new Date(weekAnchorDate);
            d.setDate(d.getDate() + 7);
            setWeekAnchorDate(d);
        };

        const handleDateInputChange = (e) => {
            const value = e.target.value; // 'YYYY-MM-DD'
            if (!value) return;
            setWeekAnchorDate(new Date(value));
            setSelectedDate(value);
        };

        const selectedGroup = selectedDate ? groupedByDate[selectedDate] : null;

        return (
            <div className="daily-list-container">
                {/* <div className="period-info">
                    <h2>📅 Daily Predictions</h2>
                    <p className="info-text">Weekly predictions are updated every Monday</p>
                </div> */}
                {/* Week Strip Date Selector */}
                <div className="daily-list-week-nav">
                    <div className='daily-list-week-nav'>
                        <button className="daily-list-nav-arrow" onClick={goPrevWeek} aria-label="Previous week">‹</button>

                        <div className="daily-list-day-strip">
                            {weekWindow.map((item) => {
                                const dateObj = new Date(item.date);
                                const isSelected = selectedDate === item.date;
                                const hasData = item.data && item.data.length > 0;
                                return (
                                    <button
                                        key={item.date}
                                        className={`daily-list-day-box${isSelected ? ' daily-list-day-box-active' : ''}${!hasData ? ' daily-list-day-box-empty' : ''}`}
                                        onClick={() => hasData && setSelectedDate(item.date === selectedDate ? null : item.date)}
                                        disabled={!hasData}
                                        title={!hasData ? 'No data for this date' : ''}
                                    >
                                        <span className="daily-list-day-weekday">
                                            {dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                                        </span>
                                        <span className="daily-list-day-number">{dateObj.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button className="daily-list-nav-arrow" onClick={goNextWeek} aria-label="Next week">›</button>
                    </div>

                    <button
                        className="daily-list-pick-date-btn"
                        onClick={toggleCalendar}
                    >
                        📅 Pick Date
                    </button>

                    <button
                        className="daily-list-sort-toggle"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        title={`Sort ${sortOrder === 'desc' ? 'Oldest First' : 'Latest First'}`}
                    >
                        {sortOrder === 'desc' ? '⬇️ Latest First' : '⬆️ Oldest First'}
                    </button>
                </div>

                {/* Pick Date dropdown panel (reuses the original calendar-view data/behaviour) */}
                {isCalendarOpen && (
                    <div className="daily-list-pick-date-panel">
                        <input
                            type="date"
                            className="daily-list-date-input"
                            value={selectedDate || toISODate(weekAnchorDate)}
                            onChange={handleDateInputChange}
                        />
                    </div>
                )}

                {/* Selected Date Bar */}
                {selectedDate && selectedGroup && (
                    <div className="daily-list-selected-bar">
                        <div className="daily-list-selected-bar-left">
                            <span className="daily-list-selected-bar-icon">📅</span>
                            <div>
                                {/* <div className="daily-list-selected-bar-label">SELECTED DATE</div> */}
                                <div className="daily-list-section-title">{formatDate(selectedDate)}</div>
                                <span className="daily-list-total-rasi">
                                    {selectedGroup.data?.length || 0} Rasis
                                </span>
                            </div>
                        </div>

                        <div className="daily-list-selected-bar-right">
                            <span className="daily-list-selected-bar-status-label">
                                Status: {selectedGroup.status === 'allow' ? 'Enabled' : 'Disabled'}
                            </span>
                            <button
                                className={`daily-list-status-switch ${selectedGroup.status === 'allow' ? 'is-on' : 'is-off'}`}
                                onClick={() => handleStatusToggle(selectedDate, selectedGroup.status)}
                                disabled={isUpdatingStatus[selectedDate]}
                                aria-label="Toggle status"
                            >
                                {isUpdatingStatus[selectedDate] ? (
                                    <span className="daily-list-loading-spinner"></span>
                                ) : (
                                    <span className="daily-list-status-switch-knob"></span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Rasi Card Grid */}
                <div className="daily-list-card-section">
                    {selectedDate && selectedGroup && (
                        <>
                            <div className="daily-list-card-grid">
                                {selectedGroup.data?.map((rasi, index) => {
                                    const rasiInfo = rasiData[rasi.rasiId] || { name: rasi.name, color: '#666', emoji: '⭐' };
                                    const parentId = selectedGroup.id;
                                    const isPublished = selectedGroup.status === 'allow';
                                    const expanded = expandedItems[rasi.rasiId];

                                    return (
                                        <div
                                            key={`${selectedDate}-${index}`}
                                            className="daily-list-card"
                                            style={{ '--daily-list-accent': rasiInfo.color }}
                                        >
                                            <div className="daily-list-card-header">
                                                <div className="daily-list-card-header">
                                                    <span className="daily-list-card-icon">{rasiInfo.emoji}</span>
                                                    <div className="daily-list-card-title-group">
                                                        <h4 className="daily-list-card-title">{rasi.name || rasiInfo.name}</h4>
                                                        <span className="daily-list-card-subtitle">
                                                            {(rasi.name || rasiInfo.name || '').toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="daily-list-manage-btn"
                                                    onClick={() => handleEditClick(rasi, 'daily', selectedDate, parentId)}
                                                >
                                                    Edit
                                                </button>
                                            </div>

                                            <p className="daily-list-card-desc">
                                                {expanded
                                                    ? rasi.summary
                                                    : `${rasi.summary.slice(0, 120)}... `}
                                                {rasi.summary.length > 120 && (
                                                    <span
                                                        onClick={() => toggleReadMore(rasi.rasiId)}
                                                        style={{ color: "blue", cursor: "pointer" }}
                                                    >
                                                        {expanded ? "Read Less" : "Read More"}
                                                    </span>
                                                )}
                                            </p>

                                            <div className="daily-list-lucky-row">
                                                <div className="daily-list-lucky-chip">
                                                    <span className="daily-list-lucky-chip-icon">🎲</span>
                                                    <div>
                                                        <div className="daily-list-lucky-chip-label">அதிர்ஷ்ட எண்கள்</div>
                                                        <div className="daily-list-lucky-chip-value">{rasi.luckyNumbers}</div>
                                                    </div>
                                                </div>
                                                <div className="daily-list-lucky-chip">
                                                    <span className="daily-list-lucky-chip-icon">🧭</span>
                                                    <div>
                                                        <div className="daily-list-lucky-chip-label">நல்ல திசை</div>
                                                        <div className="daily-list-lucky-chip-value">{rasi.lucky_dr}</div>
                                                    </div>
                                                </div>
                                                <div className="daily-list-lucky-chip">
                                                    <span className="daily-list-lucky-chip-icon">🎨</span>
                                                    <div>
                                                        <div className="daily-list-lucky-chip-label">நல்ல நிறம்</div>
                                                        <div className="daily-list-lucky-chip-value">{rasi.lucky_color}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {rasi.imageUrl && (
                                                <div className="daily-list-card-image-section">
                                                    <div className="daily-list-card-image-header">
                                                        <span>🖼️</span> ராசி படம்
                                                    </div>
                                                    <img
                                                        src={rasi.imageUrl}
                                                        alt={rasi.name}
                                                        className="daily-list-card-image"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div className="daily-list-card-footer">
                                                <span className="daily-list-card-footer-status">
                                                    <span
                                                        className={`daily-list-status-dot ${isPublished ? 'is-published' : 'is-unpublished'}`}
                                                    ></span>
                                                    {isPublished ? 'Published' : 'Unpublished'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };
    // Render Weekly Content — shows only the selected week, navigable via prev/next
    const renderWeeklyContent = () => {
        if (!weeklyData.length) return <div className="week-list-no-data">No weekly data available</div>;

        const totalWeeks = weeklyData.length;
        const currentIndex = Math.min(selectedWeekIndex, totalWeeks - 1);
        const week = weeklyData[currentIndex];

        const goPrevWeek = () => setSelectedWeekIndex((i) => Math.max(0, i - 1));
        const goNextWeek = () => setSelectedWeekIndex((i) => Math.min(totalWeeks - 1, i + 1));

        return (
            <div className="week-list-container">
                {/* <div className="period-info">
                    <h2>📊 Weekly Predictions</h2>
                    <p className="info-text">Weekly predictions are updated every Monday</p>
                </div> */}
                <div className="week-list-page-header">
                    {/* <div>
                        <h2 className="week-list-title">
                            <span className="week-list-title-icon">📅</span>
                            Weekly Rasipalan
                        </h2>
                        <p className="week-list-subtitle">Manage astrological predictions for the coming week.</p>
                    </div> */}

                    {totalWeeks > 1 && (
                        <div className="month-list-select-wrap">
                            <span className="month-list-select-label">SELECT WEEK</span>
                            <div className="week-list-nav">

                                <button
                                    type="button"
                                    className="week-list-nav-arrow"
                                    onClick={goPrevWeek}
                                    disabled={currentIndex === 0}
                                    aria-label="Previous week"
                                >
                                    ‹
                                </button>
                                <span className="week-list-nav-label">{week.date}</span>
                                <button
                                    type="button"
                                    className="week-list-nav-arrow"
                                    onClick={goNextWeek}
                                    disabled={currentIndex === totalWeeks - 1}
                                    aria-label="Next week"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="week-list-week-block">
                    <div className="week-list-selected-card">
                        <div className="week-list-selected-left">
                            <span className="week-list-selected-icon">🗓️</span>
                            <div>
                                {/* <div className="week-list-selected-title">Selected Week</div> */}
                                <div className="week-list-selected-title">{week.date}</div>
                            </div>
                        </div>
                        <span className="week-list-enabled-pill">ENABLED</span>
                    </div>

                    {week.rasi && week.rasi.length > 0 ? (
                        <div className="week-list-grid">
                            {week.rasi.map((rasi, rasiIndex) => {
                                const rasiInfo = rasiData[rasi.rasi] || { name: rasi.name, color: '#666', emoji: '⭐' };
                                const hasContent = !!(rasi.kiraganam && String(rasi.kiraganam).trim());

                                return (
                                    <div
                                        key={rasiIndex}
                                        className="week-list-card"
                                        style={{ '--week-list-accent': rasiInfo.color }}
                                    >
                                        <div className="week-list-card-top">
                                            <div style={{ display: 'flex', gap: 10 }} >
                                                <span className="week-list-card-number">{rasiIndex + 1}</span>
                                                <h4 className="week-list-card-name">
                                                    {rasiInfo.emoji} {rasi.name || rasiData[rasi.rasi]?.name || `ராசி ${rasi.rasi}`}
                                                </h4>
                                            </div>
                                            <span className={`week-list-status-badge ${hasContent ? 'is-published' : 'is-draft'}`}>
                                                {hasContent ? 'PUBLISHED' : 'DRAFT'}
                                            </span>
                                        </div>

                                        <h5>
                                            <span className="info-icon">🌟</span>
                                            கிரகணம்
                                        </h5>
                                        <p className="week-list-card-desc">
                                            {hasContent
                                                ? rasi.kiraganam
                                                : 'No summary generated yet. Click edit to start writing predictions for this week.'}
                                        </p>
                                        <h5>
                                            <span className="info-icon">📈</span>
                                            வாராந்திர கிரகணம்
                                        </h5>

                                        <p className="week-list-card-desc">
                                            {rasi.weekly_kiraganam
                                                ? rasi.weekly_kiraganam
                                                : 'No summary generated yet. Click edit to start writing predictions for this week.'}
                                        </p>
                                        <h5>
                                            <span className="info-icon">👍</span>
                                            நன்மைகள்
                                        </h5>
                                        <p className="week-list-card-desc">
                                            {rasi.advantages
                                                ? rasi.advantages
                                                : 'No summary generated yet. Click edit to start writing predictions for this week.'}
                                        </p>
                                        <h5>
                                            <span className="info-icon">🙏</span>
                                            பிரார்த்தனைகள்
                                        </h5>
                                        <p className="week-list-card-desc">
                                            {rasi.prayers
                                                ? rasi.prayers
                                                : 'No summary generated yet. Click edit to start writing predictions for this week.'}
                                        </p>
                                        <div className="week-list-card-footer">
                                            <span className="week-list-card-footer-note">
                                                {rasi.prayers ? '🙏 Prayers added' : '✎ Not edited'}
                                            </span>
                                            <button
                                                type="button"
                                                className="week-list-edit-link"
                                                onClick={() => handleEditClick(rasi, 'weekly', week, week.id)}
                                                title="Edit Weekly Rasi"
                                            >
                                                {hasContent ? 'Edit Details →' : 'Create Prediction ⊕'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="week-list-no-data">No data is available for the selected week</div>
                    )}
                </div>
            </div >
        );
    };
    const renderMonthlyContent = () => {
        if (!monthlyData.length) {
            return <div className="month-list-no-data">No monthly data available</div>;
        }

        const totalMonths = monthlyData.length;
        const currentIndex = Math.min(selectedMonthIndex, totalMonths - 1);
        const month = monthlyData[currentIndex];

        return (
            <div className="month-list-container">
                {/* <div className="period-info">
                    <h2>📈 Monthly Predictions</h2>
                    <p className="info-text">Weekly predictions are updated every Monday</p>
                </div> */}
                <div className="month-list-page-header">
                    {/* <div>
                        <h2 className="month-list-title">
                            <span className="month-list-title-icon">📅</span>
                            Monthly Rasipalan
                        </h2>
                        <p className="month-list-subtitle">Curate and publish monthly astrological insights for all signs.</p>
                    </div> */}
                    {totalMonths > 1 && (
                        <div className="month-list-select-wrap">
                            <span className="month-list-select-label">SELECT MONTH</span>
                            <select
                                className="month-list-select"
                                value={currentIndex}
                                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                            >
                                {monthlyData.map((m, idx) => (
                                    <option key={m.id || idx} value={idx}>
                                        {m.date || m.tamil_month || `Month ${idx + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="month-list-month-block">

                    {/* Status Bar */}
                    <div className="month-list-status-bar">
                        <div className="month-list-status-left">
                            <span className="month-list-status-dot"></span>
                            <span className="month-list-status-text">
                                <strong>{month.date || month.tamil_month}</strong>
                            </span>
                            <span className="month-list-live-badge">Active</span>
                        </div>
                        <span className="month-list-lang-pill">
                            {month.mon_lan === 'tamil' ? 'தமிழ்' : 'English'}
                        </span>
                    </div>

                    {/* Rasi Cards */}
                    {month.rasi && month.rasi.length > 0 ? (
                        <div className="month-list-grid">
                            {month.rasi.map((rasi, rasiIndex) => {
                                const rasiId = getMonthlyRasiId(rasi);
                                const rasiInfo = rasiData[rasiId] || {
                                    name: rasi.name || 'ராசி',
                                    emoji: '⭐',
                                    color: '#999'
                                };
                                const hasContent = !!(rasi.kiraganam && String(rasi.kiraganam).trim());
                                const expanded = expandedMonItems[rasi.rasiId];
                                return (
                                    <div
                                        key={rasiIndex}
                                        className="month-list-card"
                                        style={{ '--month-list-accent': rasiInfo.color }}
                                    >
                                        {/* Header */}
                                        <div className="month-list-card-top">
                                            <div className='month-list-card-emoji'>
                                                <span className="month-list-card-icon">{rasiInfo.emoji}</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    <h4 className="month-list-card-name">{rasi.name || rasiInfo.name}</h4>
                                                    {rasiId && (
                                                        <span className="month-list-card-sub">{`RASI ${rasiId}`}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="month-list-edit-icon-btn"
                                                onClick={() => handleEditClick(rasi, 'monthly', month, month.id)}
                                                title="Edit Monthly Rasi"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        {/* Content */}
                                        {/* <p className="month-list-card-desc">{rasi.kiraganam || '—'}</p> */}
                                        <p className="daily-list-card-desc">
                                            {expanded
                                                ? rasi.kiraganam
                                                : `${rasi.kiraganam.slice(0, 120)}... `}
                                            {rasi.kiraganam.length > 120 && (
                                                <span
                                                    onClick={() => toggleMonReadMore(rasi.rasiId)}
                                                    style={{ color: "blue", cursor: "pointer" }}
                                                >
                                                    {expanded ? "Read Less" : "Read More"}
                                                </span>
                                            )}
                                        </p>
                                        {/* Image */}
                                        {rasi.imageUrl && (
                                            <div className="month-list-card-image-section">
                                                <img
                                                    src={rasi.imageUrl}
                                                    alt={rasi.name}
                                                    className="month-list-card-image"
                                                    onError={(e) => (e.target.style.display = 'none')}
                                                />
                                            </div>
                                        )}
                                        <div className="month-list-card-footer">
                                            <span className={`month-list-progress-text ${hasContent ? 'is-published' : 'is-draft'}`}>
                                                {hasContent ? '100% Published' : 'Drafting'}
                                            </span>
                                            <span className="month-list-prayer-note">
                                                {rasi.prayers ? '🙏 Prayers set' : '🙏 No prayers'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="month-list-no-data">No data is available for the selected month</div>
                    )}
                </div>
            </div>
        );
    };
    const renderYearlyContent = () => {
        if (!yearlyData.length) {
            return <div className="year-list-no-data">No yearly data available</div>;
        }

        const totalYears = yearlyData.length;
        const currentIndex = Math.min(selectedYearIndex, totalYears - 1);
        const yearItem = yearlyData[currentIndex];

        return (
            <div className="year-list-container">
                {/* <div className="period-info">
                    <h2>📆 Yearly Predictions</h2>
                    <p className="info-text">Weekly predictions are updated every Monday</p>
                </div> */}
                <div className="year-list-year-block">

                    {/* Year Header */}
                    <div className="year-list-header">
                        <div>
                            <span className="year-list-selector-label">SELECT YEAR</span>
                            <div className="year-list-selector">
                                {totalYears > 1 ? (
                                    <select
                                        className="year-list-selector-select"
                                        value={currentIndex}
                                        onChange={(e) => setSelectedYearIndex(Number(e.target.value))}
                                    >
                                        {yearlyData.map((y, idx) => (
                                            <option key={y.id || idx} value={idx}>
                                                {y.date || `Year ${idx + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="year-list-selector-value">{yearItem.date}</span>
                                )}
                            </div>
                        </div>
                        {/* <div className="year-list-status">
                            <div className="year-list-status-text-group">
                                <span className="year-list-status-label">STATUS</span>
                                <span className="year-list-status-value">Selected Year</span>
                            </div>
                            <span className={`year-list-status-pill ${yearItem.Status ? 'is-enabled' : 'is-disabled'}`}>
                                <span className="year-list-status-pill-knob"></span>
                            </span>
                        </div> */}
                    </div>

                    {/* Status Bar */}
                    <div className="month-list-status-bar">
                        <div className="month-list-status-left">
                            <span className="month-list-status-dot"></span>
                            <span className="month-list-status-text">
                                <strong>{yearItem.date || yearItem.tamil_month}</strong>
                            </span>
                            <span className="month-list-live-badge">{yearItem.Status === 1 ? "Active" : "Inactive"}</span>
                        </div>
                        <span className="month-list-lang-pill">
                            {yearItem.mon_lan === 'tamil' ? 'தமிழ்' : 'English'}
                        </span>
                    </div>

                    {/* Rasi Cards */}
                    {yearItem.rasi && yearItem.rasi.length > 0 ? (
                        <div className="year-list-grid">
                            {yearItem.rasi.map((rasi, rasiIndex) => {
                                const rasiId = getYearlyRasiId(rasi);
                                const rasiInfo = rasiData[rasiId] || {
                                    name: rasi.name || 'ராசி',
                                    emoji: '⭐',
                                    color: '#888'
                                };
                                return (
                                    <div
                                        key={rasiIndex}
                                        className="year-list-card"
                                        style={{ '--year-list-accent': rasiInfo.color }}
                                    >
                                        {/* Header */}
                                        <div className="year-list-card-top">
                                            <div className='month-list-card-emoji'>
                                                <span className="year-list-card-icon">{rasiInfo.emoji}</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    <h4 className="year-list-card-name">{rasi.name || rasiInfo.name}</h4>
                                                    <span className="year-list-card-sub">
                                                        {(rasiInfo.name || '').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="year-list-edit-icon-btn"
                                                onClick={() => handleEditClick(rasi, 'yearly', yearItem, rasi.id)}
                                                title="Edit Yearly Rasi"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        {/* Content */}
                                        <div className="year-list-card-desc">
                                            {renderComplexValue(rasi.kiraganam)}
                                        </div>
                                        {rasi.rasi_des && (
                                            <p className="year-list-card-note">{rasi.rasi_des}</p>
                                        )}
                                        {/* Image */}
                                        {rasi.imageUrl && (
                                            <div className="year-list-card-image-section">
                                                <img
                                                    src={rasi.imageUrl}
                                                    alt={rasi.name}
                                                    className="year-list-card-image"
                                                    onError={(e) => (e.target.style.display = 'none')}
                                                />
                                            </div>
                                        )}
                                        <div className="year-list-card-footer">
                                            <span className="year-list-last-edit">
                                                {rasi.prayers ? '🙏 Prayers set' : '🙏 —'}
                                            </span>
                                            <span className={`year-list-status-badge ${yearItem.Status ? 'is-published' : 'is-draft'}`}>
                                                {yearItem.Status ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="year-list-no-data">No data is available for the selected year</div>
                    )}
                </div>
            </div>
        );
    };
    // Render Loading State
    const renderLoading = () => (
        <Loder />
    );
    // Render Error State
    const renderError = () => (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchData}>
                🔄 Retry
            </button>
            <p className="error-help">
                If the problem persists, please check your internet connection
            </p>
        </div>
    );
    // Render Empty State
    const renderEmptyState = () => (
        <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Data Available</h3>
            <p>There are no {activeTab} predictions to display at the moment.</p>
            <p className="empty-subtext">Please check back later or try another tab.</p>
        </div>
    );
    // Render content based on active tab
    const renderContent = () => {
        if (loading) {
            return renderLoading();
        }
        if (error) {
            return renderError();
        }
        switch (activeTab) {
            case 'daily':
                if (!dailyData.length) return renderEmptyState();
                return renderDailyContent();
            case 'weekly':
                if (!weeklyData.length) return renderEmptyState();
                return renderWeeklyContent();
            case 'monthly':
                if (!monthlyData.length) return renderEmptyState();
                return renderMonthlyContent();
            case 'yearly':
                if (!yearlyData.length) return renderEmptyState();
                return renderYearlyContent();
            default:
                return null;
        }
    };
    return (
        <div className="rasi-all-list-container">
            <div className="container">
                {/* Header */}
                <header className="main-header">
                    <h1 className="main-title">
                        <span className="title-icon">⭐</span>
                        ராசி பலன்
                    </h1>
                    <p className="subtitle">
                        Daily, Weekly & Monthly Rasi Predictions in Tamil
                    </p>
                </header>
                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('daily');
                                setSelectedDate(null);
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📅</span>
                            Daily
                        </button>
                        <button
                            className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('weekly');
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📊</span>
                            Weekly
                        </button>
                        <button
                            className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('monthly');
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📈</span>
                            Monthly
                        </button>
                        <button
                            className={`tab ${activeTab === 'yearly' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('yearly');
                                setIsEditing(false);
                            }}
                        >
                            <span className="tab-icon">📆</span>
                            Yearly
                        </button>
                    </div>
                </div>
                {/* Content */}
                <div className="content-container">
                    {renderContent()}
                </div>
            </div>
            {/* Edit Modal (rendered outside main content) */}
            {isEditing && renderEditModal()}
        </div>
    );
};
export default RasiAllList;