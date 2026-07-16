import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/RasiUploadForm.css';

const rasiOptions = [
  { name: "மேஷம்", rasiId: "1" },
  { name: "ரிஷபம்", rasiId: "2" },
  { name: "மிதுனம்", rasiId: "3" },
  { name: "கடகம்", rasiId: "4" },
  { name: "சிம்மம்", rasiId: "5" },
  { name: "கன்னி", rasiId: "6" },
  { name: "துலாம்", rasiId: "7" },
  { name: "விருச்சிகம்", rasiId: "8" },
  { name: "தனுசு", rasiId: "9" },
  { name: "மகரம்", rasiId: "10" },
  { name: "கும்பம்", rasiId: "11" },
  { name: "மீனம்", rasiId: "12" }
];

const englishMonths = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const tamilMonths = [
  "சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி",
  "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"
];

const RasiUpdateForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [yearlyLanguage, setYearlyLanguage] = useState('english');
  const [monthlyLanguage, setMonthlyLanguage] = useState('english');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [selectedSunday, setSelectedSunday] = useState(null);
  const [sundayPickerOpen, setSundayPickerOpen] = useState(false);
  const [sundayPickerDate, setSundayPickerDate] = useState('');

  const [formData, setFormData] = useState({
    date: '',
    duration: '',
    rasiId: '',
    name: '',
    summary: '',
    luckyNumbers: '',
    lucky_dr: '',
    lucky_color: '',
    kiraganam: '',
    weekly_kiraganam: '',
    advantages: '',
    prayers: '',
    image: '',
    mon_lan: '',
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

  const [monthlyDate, setMonthlyDate] = useState({ month: '', year: '' });
  const [yearlyDate, setYearlyDate] = useState({ year: '' });
  const [kiraganamRows, setKiraganamRows] = useState([{ title: '', value: '' }]);
  const [kiraganamEyeRows, setKiraganamEyeRows] = useState([{ title: '', value: '' }]);

  const getSunday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getSaturday = (sunday) => {
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return saturday;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekRangeString = (sunday) => {
    if (!sunday) return '';
    const saturday = getSaturday(sunday);
    return `${formatDate(sunday)}==${formatDate(saturday)}`;
  };

  const setCurrentWeek = () => {
    const today = new Date();
    const currentSunday = getSunday(today);
    setSelectedSunday(currentSunday);
    setFormData(prev => ({
      ...prev,
      date: getWeekRangeString(currentSunday)
    }));
  };

  const goToPreviousWeek = () => {
    if (selectedSunday) {
      const prevSunday = new Date(selectedSunday);
      prevSunday.setDate(prevSunday.getDate() - 7);
      setSelectedSunday(prevSunday);
      setFormData(prev => ({
        ...prev,
        date: getWeekRangeString(prevSunday)
      }));
    }
  };

  const goToNextWeek = () => {
    if (selectedSunday) {
      const nextSunday = new Date(selectedSunday);
      nextSunday.setDate(nextSunday.getDate() + 7);
      setSelectedSunday(nextSunday);
      setFormData(prev => ({
        ...prev,
        date: getWeekRangeString(nextSunday)
      }));
    }
  };

  const openSundayPicker = () => {
    if (selectedSunday) {
      setSundayPickerDate(formatDate(selectedSunday));
    } else {
      setSundayPickerDate('');
    }
    setSundayPickerOpen(true);
  };

  const handleSundayPickerSelect = () => {
    if (sundayPickerDate) {
      const selectedDate = new Date(sundayPickerDate);
      const selectedSunday = getSunday(selectedDate);
      setSelectedSunday(selectedSunday);
      setFormData(prev => ({
        ...prev,
        date: getWeekRangeString(selectedSunday)
      }));
    }
    setSundayPickerOpen(false);
  };

  const getWeekDisplay = () => {
    if (!selectedSunday) return 'Select a week';
    const saturday = getSaturday(selectedSunday);
    return `${formatDate(selectedSunday)} to ${formatDate(saturday)}`;
  };

  const isDateSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    resetFormForTab(newValue);
  };

  const resetFormForTab = (tabIndex) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let currentMonth = '';
    if (tabIndex === 2) {
      if (monthlyLanguage === 'english') {
        currentMonth = englishMonths[today.getMonth()];
      } else {
        currentMonth = tamilMonths[0];
      }
    }

    const resetData = {
      date: '',
      duration: '',
      rasiId: '',
      name: '',
      summary: '',
      luckyNumbers: '',
      lucky_dr: '',
      lucky_color: '',
      kiraganam: '',
      weekly_kiraganam: '',
      advantages: '',
      prayers: '',
      image: '',
      mon_lan: '',
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

    if (tabIndex === 0) {
      resetData.date = formatDate(today);
    } else if (tabIndex === 1) {
      const currentSunday = getSunday(today);
      setSelectedSunday(currentSunday);
      resetData.date = getWeekRangeString(currentSunday);
    } else if (tabIndex === 2) {
      setMonthlyDate({ month: currentMonth, year: currentYear.toString() });
      resetData.date = `${currentMonth}-${currentYear}`;
      resetData.mon_lan = monthlyLanguage;
      if (monthlyLanguage === 'tamil') {
        resetData.tamil_month_name = currentMonth;
      }
    } else if (tabIndex === 3) {
      if (yearlyLanguage === 'english') {
        setYearlyDate({ year: currentYear.toString(), year_name: '' });
        resetData.date = currentYear.toString();
      } else {
        setYearlyDate({ year: currentYear.toString(), year_name: 'பரபாவ' });
        resetData.date = currentYear.toString();
        resetData.year_name = 'பரபாவ';
      }
      resetData.mon_lan = yearlyLanguage;
    }
    setFormData(resetData);
    setKiraganamRows([{}]);
    setKiraganamEyeRows([{}]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMonthlyDateChange = (field, value) => {
    const newMonthlyDate = { ...monthlyDate, [field]: value };
    setMonthlyDate(newMonthlyDate);

    if (newMonthlyDate.month && newMonthlyDate.year) {
      const formattedDate = `${newMonthlyDate.month}-${newMonthlyDate.year}`;
      setFormData(prev => ({ ...prev, date: formattedDate }));

      if (monthlyLanguage === 'tamil' && newMonthlyDate.month && newMonthlyDate.year) {
        const formattedDate = `${newMonthlyDate.month}-${newMonthlyDate.year}`;
        setFormData(prev => ({ ...prev, tamil_month_name: formattedDate }));
      }
    }
  };

  const handleYearlyDateChange = (field, value) => {
    const newYearlyDate = { ...yearlyDate, [field]: value };
    setYearlyDate(newYearlyDate);

    if (yearlyLanguage === 'english') {
      if (newYearlyDate.year) {
        const updatedFormData = { date: newYearlyDate.year };
        setFormData(prev => ({ ...prev, ...updatedFormData }));
      }
    } else {
      if (newYearlyDate.year && newYearlyDate.year_name) {
        const updatedFormData = {
          date: newYearlyDate.year,
          year_name: newYearlyDate.year_name
        };
        setFormData(prev => ({ ...prev, ...updatedFormData }));
      }
    }
  };

  const handleRasiChange = (e) => {
    const selectedId = e.target.value;
    const selectedRasi = rasiOptions.find(r => r.rasiId === selectedId);
    setFormData(prev => ({
      ...prev,
      rasiId: selectedId,
      name: selectedRasi?.name || ''
    }));
  };

  const getCurrentMonths = () => {
    return monthlyLanguage === 'english' ? englishMonths : tamilMonths;
  };

  const handleKiraganamChange = (index, field, value) => {
    const newRows = [...kiraganamRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setKiraganamRows(newRows);
  };

  const handleKiraganamEyeChange = (index, field, value) => {
    const newRows = [...kiraganamEyeRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setKiraganamEyeRows(newRows);
  };

  const addKiraganamRow = () => {
    setKiraganamRows([...kiraganamRows, { title: '', value: '' }]);
  };

  const addKiraganamEyeRow = () => {
    setKiraganamEyeRows([...kiraganamEyeRows, { title: '', value: '' }]);
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

  const validateForm = () => {
    if (!formData.rasiId) {
      setNotification({
        open: true,
        message: 'Please select a Rasi',
        severity: 'error'
      });
      return false;
    }

    if (activeTab === 0) {
      if (!formData.date || !formData.summary) {
        setNotification({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return false;
      }
    } else if (activeTab === 1) {
      if (!formData.date || !formData.kiraganam) {
        setNotification({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return false;
      }
    } else if (activeTab === 2) {
      if (!formData.date || !formData.mon_lan) {
        setNotification({
          open: true,
          message: 'Please fill month, year and language',
          severity: 'error'
        });
        return false;
      }
    } else if (activeTab === 3) {
      if (!formData.date || !formData.mon_lan) {
        setNotification({
          open: true,
          message: 'Please fill year and language',
          severity: 'error'
        });
        return false;
      }

      const invalidKiraganam = kiraganamRows.some(row =>
        (row.title && !row.value) || (!row.title && row.value)
      );

      const invalidKiraganamEye = kiraganamEyeRows.some(row =>
        (row.title && !row.value) || (!row.title && row.value)
      );

      if (invalidKiraganam) {
        setNotification({
          open: true,
          message: 'Please fill both title and value for all kiraganam entries',
          severity: 'error'
        });
        return false;
      }

      if (invalidKiraganamEye) {
        setNotification({
          open: true,
          message: 'Please fill both title and value for all kiraganam eye entries',
          severity: 'error'
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    let payload = { ...formData };
    const endpoint = getEndpoint();

    if (activeTab === 3) {
      const formattedKiraganam = kiraganamRows
        .filter(row => row.title && row.value)
        .map(row => ({
          title: row.title,
          value: row.value
        }));

      const formattedKiraganamEye = kiraganamEyeRows
        .filter(row => row.title && row.value)
        .map(row => ({
          title: row.title,
          value: row.value
        }));

      payload.kiraganam = formattedKiraganam;
      payload.kiraganam_eye = formattedKiraganamEye;

      if (yearlyLanguage === 'tamil' && yearlyDate.year_name) {
        payload.year_name = yearlyDate.year_name;
      }
    } else if (activeTab === 2) {
      if (monthlyLanguage === 'tamil') {
        payload.tamil_month_name = `${monthlyDate.month}-${monthlyDate.year}`;
      }
    }

    try {
      const response = await axios.post(endpoint, payload);

      setNotification({
        open: true,
        message: `${getTabName()} updated successfully!`,
        severity: 'success'
      });

      if (response.data.success === false) {
        setNotification({
          open: true,
          message: `This rasiId already stored for this date.`,
          severity: 'error'
        });
      }

      resetFormForTab(activeTab);
    } catch (error) {
      setNotification({
        open: true,
        message: `Error updating ${getTabName()}: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const getEndpoint = () => {
    const endpoints = [
      'https://users.mpdatahub.com/api/rasi-daily-store',
      'https://users.mpdatahub.com/api/storeweekly',
      'https://users.mpdatahub.com/api/storemonthly',
      'https://users.mpdatahub.com/api/storeyearly'
    ];
    return endpoints[activeTab];
  };

  const getTabName = () => {
    const names = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
    return names[activeTab];
  };

  useEffect(() => {
    if (activeTab === 2) {
      setFormData(prev => ({
        ...prev,
        mon_lan: monthlyLanguage
      }));

      const currentMonths = getCurrentMonths();
      const newMonth = monthlyDate.month && currentMonths.includes(monthlyDate.month)
        ? monthlyDate.month
        : currentMonths[0];

      setMonthlyDate(prev => ({ ...prev, month: newMonth }));

      if (newMonth && monthlyDate.year) {
        const updatedFormData = {
          date: `${newMonth}-${monthlyDate.year}`,
          mon_lan: monthlyLanguage
        };

        if (monthlyLanguage === 'tamil' && newMonth && monthlyDate.year) {
          updatedFormData.tamil_month_name = `${newMonth}-${monthlyDate.year}`;
        }

        setFormData(prev => ({ ...prev, ...updatedFormData }));
      }
    } else if (activeTab === 3) {
      setFormData(prev => ({
        ...prev,
        mon_lan: yearlyLanguage
      }));

      let newYear = yearlyDate.year || new Date().getFullYear().toString();
      let newYearName = yearlyDate.year_name;

      if (yearlyLanguage === 'tamil') {
        if (!newYearName) {
          newYearName = 'பரபாவ';
        }
      } else {
        newYearName = '';
      }

      setYearlyDate({ year: newYear, year_name: newYearName });

      const updatedFormData = {
        date: newYear,
        mon_lan: yearlyLanguage
      };

      if (yearlyLanguage === 'tamil') {
        updatedFormData.year_name = newYearName;
      }

      setFormData(prev => ({ ...prev, ...updatedFormData }));
    }
  }, [monthlyLanguage, yearlyLanguage, activeTab]);

  useEffect(() => {
    resetFormForTab(activeTab);
  }, [monthlyLanguage, yearlyLanguage]);

  const renderDateInput = () => {
    if (activeTab === 0) {
      return (
        <div className="rasi-form__form-group">
          <label className="rasi-form__label">Date</label>
          <input
            className="rasi-form__input"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            type="date"
            placeholder='Select Date'
          />
        </div>
      );
    } else if (activeTab === 1) {
      return (
        <div className="rasi-form__week-section">
          <div className="rasi-form__week-nav">
            <button
              className="rasi-form__nav-btn rasi-form__nav-btn--prev"
              onClick={goToPreviousWeek}
              title="Previous week"
            >
              ←
            </button>

            <div className="rasi-form__week-display">
              <div className="rasi-form__week-range">
                {getWeekDisplay()}
              </div>
              <div className="rasi-form__week-label">Selected Week Range</div>
            </div>

            <button
              className="rasi-form__nav-btn rasi-form__nav-btn--next"
              onClick={goToNextWeek}
              title="Next week"
            >
              →
            </button>
          </div>

          <button
            className="rasi-form__btn rasi-form__btn--outlined"
            onClick={openSundayPicker}
          >
            📅 Select Sunday of the Week
          </button>

          <div className="rasi-form__form-group">
            <label className="rasi-form__label">Week Range (Auto-generated)</label>
            <input
              className="rasi-form__input rasi-form__input--readonly"
              value={formData.date}
              readOnly
              placeholder="Format: YYYY-MM-DD==YYYY-MM-DD"
            />
            <span className="rasi-form__helper-text">Format: YYYY-MM-DD==YYYY-MM-DD</span>
          </div>

          <div className="rasi-form__card">
            <h4 className="rasi-form__card-title">Week Details:</h4>
            {selectedSunday && (
              <div className="rasi-form__week-details">
                <p><strong>Sunday:</strong> {formatDate(selectedSunday)}</p>
                <p><strong>Monday:</strong> {formatDate(new Date(selectedSunday.getTime() + 24 * 60 * 60 * 1000))}</p>
                <p><strong>Tuesday:</strong> {formatDate(new Date(selectedSunday.getTime() + 2 * 24 * 60 * 60 * 1000))}</p>
                <p><strong>Wednesday:</strong> {formatDate(new Date(selectedSunday.getTime() + 3 * 24 * 60 * 60 * 1000))}</p>
                <p><strong>Thursday:</strong> {formatDate(new Date(selectedSunday.getTime() + 4 * 24 * 60 * 60 * 1000))}</p>
                <p><strong>Friday:</strong> {formatDate(new Date(selectedSunday.getTime() + 5 * 24 * 60 * 60 * 1000))}</p>
                <p><strong>Saturday:</strong> {formatDate(getSaturday(selectedSunday))}</p>
              </div>
            )}
          </div>

          <button
            className="rasi-form__btn rasi-form__btn--outlined"
            onClick={setCurrentWeek}
          >
            📅 Jump to Current Week
          </button>
        </div>
      );
    } else if (activeTab === 2) {
      return (
        <div className="rasi-form__date-inputs">
          <div className="rasi-form__row rasi-form__row--half">
            <div className="rasi-form__form-group">
              <label className="rasi-form__label">Month</label>
              <select
                className="rasi-form__select"
                value={monthlyDate.month}
                onChange={(e) => handleMonthlyDateChange('month', e.target.value)}
              >
                <option value="">Select Month</option>
                {getCurrentMonths().map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="rasi-form__form-group">
              <label className="rasi-form__label">Year</label>
              <input
                className="rasi-form__input"
                value={monthlyDate.year}
                onChange={(e) => handleMonthlyDateChange('year', e.target.value)}
                type="number"
                min="2000"
                max="2100"
                placeholder="2026"
              />
            </div>
            <span className="rasi-form__helper-text">
              Will be sent as: {formData.date || 'Select month and year'}
            </span>
          </div>
        </div>
      );
    } else if (activeTab === 3) {
      return (
        <div className="rasi-form__date-inputs">
          <div className={yearlyLanguage === 'tamil' ? 'rasi-form__form-group rasi-form__form-group--half' : 'rasi-form__form-group'}>
            <label className="rasi-form__label">Year</label>
            <input
              className="rasi-form__input"
              value={yearlyDate.year}
              onChange={(e) => handleYearlyDateChange('year', e.target.value)}
              type="number"
              min="2000"
              max="2100"
              placeholder="2026"
            />
          </div>

          {yearlyLanguage === 'tamil' && (
            <div className="rasi-form__form-group rasi-form__form-group--half">
              <label className="rasi-form__label">Year Name</label>
              <select
                className="rasi-form__select"
                value={yearlyDate.year_name}
                onChange={(e) => handleYearlyDateChange('year_name', e.target.value)}
              >
                <option value="">Select Year Name</option>
                <option value="விசுவாசுவ">விசுவாசுவ</option>
                <option value="பரபாவ">பரபாவ</option>
                <option value="பிலவங்க">பிலவங்க</option>
                <option value="கீலக">கீலக</option>
                <option value="சௌமிய">சௌமிய</option>
              </select>
            </div>
          )}

          <span className="rasi-form__helper-text">
            Will be sent as: {formData.date || 'Enter year'}
          </span>
        </div>
      );
    }
  };

  const tabNames = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  return (
    <div className="rasi-form__container">
      <div className="rasi-form__paper">
        <h1 className="rasi-form__title">Rasi Updates Management</h1>

        <div className="rasi-form__tabs">
          {tabNames.map((tabName, index) => (
            <button
              key={index}
              className={`rasi-form__tab ${activeTab === index ? 'rasi-form__tab--active' : ''}`}
              onClick={() => handleTabChange(index)}
            >
              {tabName}
            </button>
          ))}
        </div>

        {(activeTab === 2 || activeTab === 3) && (
          <div className="rasi-form__language-selector">
            <label className="rasi-form__label">Language</label>
            <select
              className="rasi-form__select"
              value={activeTab === 2 ? monthlyLanguage : yearlyLanguage}
              onChange={(e) => activeTab === 2 ? setMonthlyLanguage(e.target.value) : setYearlyLanguage(e.target.value)}
            >
              <option value="english">English</option>
              <option value="tamil">Tamil</option>
            </select>
          </div>
        )}

        <div className="rasi-form__form">
          <div className="rasi-form__row rasi-form__row--half">
            <div className="rasi-form__form-group">
              <label className="rasi-form__label">Rasi *</label>
              <select
                className="rasi-form__select"
                value={formData.rasiId}
                onChange={handleRasiChange}
              >
                <option value="">Select Rasi</option>
                {rasiOptions.map((rasi) => (
                  <option key={rasi.rasiId} value={rasi.rasiId}>
                    {rasi.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rasi-form__form-group">
            {renderDateInput()}
          </div>
          {(activeTab === 0 || activeTab === 1) && (
            <div className="rasi-form__form-group">
              <label className="rasi-form__label">Name</label>
              <input
                className="rasi-form__input rasi-form__input--readonly"
                value={formData.name}
                readOnly
                placeholder="Auto-filled based on Rasi selection"
              />
              <span className="rasi-form__helper-text">Auto-filled based on Rasi selection</span>
            </div>
          )}

          {activeTab === 0 && (
            <>
              <div className="rasi-form__row rasi-form__row--half">
                <div className="rasi-form__form-group">
                  <label className="rasi-form__label">Duration</label>
                  <input
                    className="rasi-form__input"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder='Duration'
                  />
                </div>
                <div className="rasi-form__form-group">
                  <label className="rasi-form__label">Lucky Numbers</label>
                  <input
                    className="rasi-form__input"
                    name="luckyNumbers"
                    value={formData.luckyNumbers}
                    onChange={handleInputChange}
                    placeholder='Lucky Numbers'
                  />
                </div>
              </div>
              <div className="rasi-form__row rasi-form__row--half">
                <div className="rasi-form__form-group">
                  <label className="rasi-form__label">Lucky Direction</label>
                  <input
                    className="rasi-form__input"
                    name="lucky_dr"
                    value={formData.lucky_dr}
                    onChange={handleInputChange}
                    placeholder='Lucky Direction'
                  />
                </div>
                <div className="rasi-form__form-group">
                  <label className="rasi-form__label">Lucky Color</label>
                  <input
                    className="rasi-form__input"
                    name="lucky_color"
                    value={formData.lucky_color}
                    onChange={handleInputChange}
                    placeholder='Lucky Color'
                  />
                </div>
              </div>
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Summary *</label>
                <textarea
                  className="rasi-form__textarea"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  placeholder='Rasi Summary'
                />
              </div>
            </>
          )}

          {activeTab === 1 && (
            <>
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Kiraganam *</label>
                <textarea
                  className="rasi-form__textarea"
                  name="kiraganam"
                  value={formData.kiraganam}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Weekly Kiraganam</label>
                <textarea
                  className="rasi-form__textarea"
                  name="weekly_kiraganam"
                  value={formData.weekly_kiraganam}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Advantages</label>
                <textarea
                  className="rasi-form__textarea"
                  name="advantages"
                  value={formData.advantages}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </>
          )}

          {(activeTab === 2 || activeTab === 3) && (
            <div className="rasi-form__row rasi-form__row--half">
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Name</label>
                <input
                  className="rasi-form__input rasi-form__input--readonly"
                  value={formData.name}
                  readOnly
                  placeholder="Auto-filled based on Rasi selection"
                />
                <span className="rasi-form__helper-text">Auto-filled based on Rasi selection</span>
              </div>
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Mon Lan</label>
                <input
                  className="rasi-form__input rasi-form__input--readonly"
                  value={formData.mon_lan}
                  readOnly
                  placeholder="Auto-filled"
                />
                <span className="rasi-form__helper-text">
                  Auto-filled based on language selection ({activeTab === 2 ? monthlyLanguage : yearlyLanguage})
                </span>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <>
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Kiraganam</label>
                <textarea
                  className="rasi-form__textarea"
                  name="kiraganam"
                  value={formData.kiraganam}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Prayers</label>
                <textarea
                  className="rasi-form__textarea"
                  name="prayers"
                  value={formData.prayers}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
            </>
          )}

          {activeTab === 3 && (
            <>
              <div className="rasi-form__card">
                <div className="rasi-form__card-header">
                  <h3 className="rasi-form__card-title">Kiraganam Data</h3>
                  <button
                    className="rasi-form__btn rasi-form__btn--small"
                    onClick={addKiraganamRow}
                  >
                    + Add Row
                  </button>
                </div>

                <div className="rasi-form__table-wrapper">
                  <table className="rasi-form__table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kiraganamRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td>{rowIndex + 1}</td>
                          <td>
                            <input
                              className="rasi-form__input rasi-form__input--small"
                              placeholder="Enter title"
                              value={row.title || ''}
                              onChange={(e) => handleKiraganamChange(rowIndex, 'title', e.target.value)}
                            />
                          </td>
                          <td>
                            <textarea
                              className="rasi-form__textarea rasi-form__textarea--small"
                              placeholder="Enter value"
                              value={row.value || ''}
                              onChange={(e) => handleKiraganamChange(rowIndex, 'value', e.target.value)}
                              rows="2"
                            />
                          </td>
                          <td>
                            <button
                              className="rasi-form__btn rasi-form__btn--danger rasi-form__btn--small"
                              onClick={() => removeKiraganamRow(rowIndex)}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rasi-form__card">
                <div className="rasi-form__card-header">
                  <h3 className="rasi-form__card-title">Kiraganam Eye Data</h3>
                  <button
                    className="rasi-form__btn rasi-form__btn--small"
                    onClick={addKiraganamEyeRow}
                  >
                    + Add Row
                  </button>
                </div>

                <div className="rasi-form__table-wrapper">
                  <table className="rasi-form__table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kiraganamEyeRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td>{rowIndex + 1}</td>
                          <td>
                            <input
                              className="rasi-form__input rasi-form__input--small"
                              placeholder="Enter title"
                              value={row.title || ''}
                              onChange={(e) => handleKiraganamEyeChange(rowIndex, 'title', e.target.value)}
                            />
                          </td>
                          <td>
                            <textarea
                              className="rasi-form__textarea rasi-form__textarea--small"
                              placeholder="Enter value"
                              value={row.value || ''}
                              onChange={(e) => handleKiraganamEyeChange(rowIndex, 'value', e.target.value)}
                              rows="2"
                            />
                          </td>
                          <td>
                            <button
                              className="rasi-form__btn rasi-form__btn--danger rasi-form__btn--small"
                              onClick={() => removeKiraganamEyeRow(rowIndex)}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Rasi Description</label>
                <textarea
                  className="rasi-form__textarea"
                  name="rasi_des"
                  value={formData.rasi_des}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="rasi-form__row rasi-form__row--half">
                <div className="rasi-form__form-group">
                  <label className="rasi-form__label">Advantages</label>
                  <textarea
                    className="rasi-form__textarea"
                    name="advantages"
                    value={formData.advantages}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
                <div className="rasi-form__form-group">
                  <label className="rasi-form__label">Prayers</label>
                  <textarea
                    className="rasi-form__textarea"
                    name="prayers"
                    value={formData.prayers}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
              </div>

              {yearlyLanguage === 'english' && (
                <div className="rasi-form__row rasi-form__row--triple">
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Officers</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Officers"
                      value={formData.Officers}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Traders</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Traders"
                      value={formData.Traders}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Pengal</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Pengal"
                      value={formData.Pengal}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Politician</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="politician"
                      value={formData.politician}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {yearlyLanguage === 'english' && (
                <div className="rasi-form__row rasi-form__row--triple">
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Artist</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="artist"
                      value={formData.artist}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Students</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="students"
                      value={formData.students}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {yearlyLanguage === 'english' && (
                <div className="rasi-form__row rasi-form__row--half">
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Good</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Good"
                      value={formData.Good}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Attention</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Attention"
                      value={formData.Attention}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {yearlyLanguage === 'tamil' && (
                <div className="rasi-form__row rasi-form__row--triple">
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Traders (தொழிலதிபர்கள்)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Traders"
                      value={formData.Traders}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Officers (அலுவலகத்தினர்)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Officers"
                      value={formData.Officers}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Police (காவல்துறையினர்)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Police"
                      value={formData.Police}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Politician (அரசியல்வாதிகள்)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="politician"
                      value={formData.politician}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {yearlyLanguage === 'tamil' && (
                <div className="rasi-form__row rasi-form__row--triple">
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Pengal (மகளிர்)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Pengal"
                      value={formData.Pengal}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Students (மாணவர்கள்)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="students"
                      value={formData.students}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {yearlyLanguage === 'tamil' && (
                <div className="rasi-form__row rasi-form__row--half">
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Good (நன்மை)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Good"
                      value={formData.Good}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                  <div className="rasi-form__form-group">
                    <label className="rasi-form__label">Attention (கவனம்)</label>
                    <textarea
                      className="rasi-form__textarea"
                      name="Attention"
                      value={formData.Attention}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              )}

              {yearlyLanguage === 'tamil' && (
                <div className="rasi-form__form-group">
                  <label className="rasi-form__label">Note (குறிப்பு)</label>
                  <textarea
                    className="rasi-form__textarea"
                    name="Note"
                    value={formData.Note}
                    onChange={handleInputChange}
                    rows="2"
                  />
                </div>
              )}
            </>
          )}

          {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
            <div className="rasi-form__form-group">
              <label className="rasi-form__label">Image URL</label>
              <input
                className="rasi-form__input"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder='Image URL'
              />
            </div>
          )}

          {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
            <div className="rasi-form__form-group">
              <label className="rasi-form__label">Prayers</label>
              <textarea
                className="rasi-form__textarea"
                name="prayers"
                value={formData.prayers}
                onChange={handleInputChange}
                rows="3"
                placeholder='Prayers'
              />
            </div>
          )}

          {activeTab === 3 && (
            <div className="rasi-form__form-group">
              <label className="rasi-form__label">Image URL</label>
              <input
                className="rasi-form__input"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder='Image URL'
              />
            </div>
          )}
        </div>

        <div className="rasi-form__actions">
          <button
            className="rasi-form__btn rasi-form__btn--primary"
            onClick={handleSubmit}
          >
            💾 Save {getTabName()} Update
          </button>
        </div>
      </div>

      {sundayPickerOpen && (
        <div className="rasi-form__modal-overlay" onClick={() => setSundayPickerOpen(false)}>
          <div className="rasi-form__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="rasi-form__modal-title">Select Sunday Date</h2>
            <div className="rasi-form__modal-content">
              <div className="rasi-form__form-group">
                <label className="rasi-form__label">Select Sunday</label>
                <input
                  className="rasi-form__input"
                  type="date"
                  value={sundayPickerDate}
                  onChange={(e) => setSundayPickerDate(e.target.value)}
                  placeholder='Select Sunday'
                />
                <span className="rasi-form__helper-text">Please select a Sunday (day of week should be Sunday)</span>
                {sundayPickerDate && !isDateSunday(sundayPickerDate) && (
                  <span className="rasi-form__error-text">Please select a Sunday. The selected date is not a Sunday.</span>
                )}
              </div>
            </div>
            <div className="rasi-form__modal-actions">
              <button
                className="rasi-form__btn rasi-form__btn--outlined"
                onClick={() => setSundayPickerOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rasi-form__btn rasi-form__btn--primary"
                onClick={handleSundayPickerSelect}
                disabled={sundayPickerDate && !isDateSunday(sundayPickerDate)}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.open && (
        <div className={`rasi-form__notification rasi-form__notification--${notification.severity}`}>
          <span className="rasi-form__notification-message">{notification.message}</span>
          <button
            className="rasi-form__notification-close"
            onClick={() => setNotification({ ...notification, open: false })}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default RasiUpdateForm;