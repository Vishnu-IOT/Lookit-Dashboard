import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Delete, Save, NavigateBefore, NavigateNext, CalendarToday } from '@mui/icons-material';
import "./simple.css"

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
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec"
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

  // Base form state
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

  // Additional state for Monthly and Yearly date inputs
  const [monthlyDate, setMonthlyDate] = useState({ month: '', year: '' });
  const [yearlyDate, setYearlyDate] = useState({ year: '' });

  // Dynamic tables for yearly
  const [kiraganamRows, setKiraganamRows] = useState([{ title: '', value: '' }]);
  const [kiraganamEyeRows, setKiraganamEyeRows] = useState([{ title: '', value: '' }]);

  // Function to get the Sunday of a given week
  const getSunday = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = d.getDate() - day; // subtract days to get to Sunday
    return new Date(d.setDate(diff));
  };

  // Function to get the Saturday of a given week (6 days after Sunday)
  const getSaturday = (sunday) => {
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return saturday;
  };

  // Function to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to get week range string
  const getWeekRangeString = (sunday) => {
    if (!sunday) return '';
    const saturday = getSaturday(sunday);
    return `${formatDate(sunday)}==${formatDate(saturday)}`;
  };

  // Function to set the current week's Sunday
  const setCurrentWeek = () => {
    const today = new Date();
    const currentSunday = getSunday(today);
    setSelectedSunday(currentSunday);
    setFormData(prev => ({ 
      ...prev, 
      date: getWeekRangeString(currentSunday) 
    }));
  };

  // Function to navigate to previous week
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

  // Function to navigate to next week
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

  // Function to open Sunday picker
  const openSundayPicker = () => {
    if (selectedSunday) {
      setSundayPickerDate(formatDate(selectedSunday));
    } else {
      setSundayPickerDate('');
    }
    setSundayPickerOpen(true);
  };

  // Function to handle Sunday selection from picker
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

  // Function to get formatted week display
  const getWeekDisplay = () => {
    if (!selectedSunday) return 'Select a week';
    const saturday = getSaturday(selectedSunday);
    return `${formatDate(selectedSunday)} to ${formatDate(saturday)}`;
  };

  // Function to check if a date is a Sunday
  const isDateSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    resetFormForTab(newValue);
  };

  const resetFormForTab = (tabIndex) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    // Get current month based on language
    let currentMonth = '';
    if (tabIndex === 2) {
      if (monthlyLanguage === 'english') {
        currentMonth = englishMonths[today.getMonth()];
      } else {
        // For Tamil, default to the first month (சித்திரை)
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
      // Set current week when switching to Weekly tab
      const currentSunday = getSunday(today);
      setSelectedSunday(currentSunday);
      resetData.date = getWeekRangeString(currentSunday);
    } else if (tabIndex === 2) {
      // Set default for monthly: current month-year
      setMonthlyDate({ month: currentMonth, year: currentYear.toString() });
      resetData.date = `${currentMonth}-${currentYear}`;
      resetData.mon_lan = monthlyLanguage;
      // Add Tamil month name if language is Tamil
      if (monthlyLanguage === 'tamil') {
        resetData.tamil_month_name = currentMonth;
      }
    } else if (tabIndex === 3) {
      // Set default for yearly
      if (yearlyLanguage === 'english') {
        setYearlyDate({ year: currentYear.toString(), year_name: '' });
        resetData.date = currentYear.toString();
      } else {
        // For Tamil, default to the first option
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

    // Special handling for date field based on active tab
    if (name === 'date') {
      if (activeTab === 0) {
        // Daily: YYYY-MM-DD format
        setFormData(prev => ({ ...prev, date: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMonthlyDateChange = (field, value) => {
    const newMonthlyDate = { ...monthlyDate, [field]: value };
    setMonthlyDate(newMonthlyDate);

    // Update formData date in "month-year" format
    if (newMonthlyDate.month && newMonthlyDate.year) {
      const formattedDate = `${newMonthlyDate.month}-${newMonthlyDate.year}`;
      setFormData(prev => ({ ...prev, date: formattedDate }));

      // Also store the Tamil month separately in formData if language is Tamil
      if (monthlyLanguage === 'tamil' && newMonthlyDate.month && newMonthlyDate.year) {
        const formattedDate = `${newMonthlyDate.month}-${newMonthlyDate.year}`;
        setFormData(prev => ({ ...prev, tamil_month_name: formattedDate }));
      }
    }
  };

  const handleYearlyDateChange = (field, value) => {
    const newYearlyDate = { ...yearlyDate, [field]: value };
    setYearlyDate(newYearlyDate);

    // Update formData based on language
    if (yearlyLanguage === 'english') {
      // For English: date = year value
      if (newYearlyDate.year) {
        const updatedFormData = { date: newYearlyDate.year };
        setFormData(prev => ({ ...prev, ...updatedFormData }));
      }
    } else {
      // For Tamil: date = year value, year_name = பரபாவ or other Tamil year names
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

  // Get current months based on selected language for monthly tab
  const getCurrentMonths = () => {
    return monthlyLanguage === 'english' ? englishMonths : tamilMonths;
  };

  // Render year input based on language for yearly tab
  const renderYearInput = () => {
    return (
      <Grid container spacing={2}>
        {/* Year input - always shown */}
        <Grid item xs={yearlyLanguage === 'tamil' ? 6 : 12}>
          <TextField
            fullWidth
            label="Year"
            value={yearlyDate.year}
            onChange={(e) => handleYearlyDateChange('year', e.target.value)}
            type="number"
            InputProps={{ inputProps: { min: 2000, max: 2100 } }}
            placeholder="2026"
          />
        </Grid>

        {/* Year name dropdown - only for Tamil language */}
        {yearlyLanguage === 'tamil' && (
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Year Name</InputLabel>
              <Select
                value={yearlyDate.year_name}
                onChange={(e) => handleYearlyDateChange('year_name', e.target.value)}
                label="Year Name"
              >
                <MenuItem value="விசுவாசுவ">விசுவாசுவ</MenuItem>
                <MenuItem value="பரபாவ">பரபாவ</MenuItem>
                {/* You can add more Tamil year names here if needed */}
                <MenuItem value="பிலவங்க">பிலவங்க</MenuItem>
                <MenuItem value="கீலக">கீலக</MenuItem>
                <MenuItem value="சௌமிய">சௌமிய</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    );
  };

  // Dynamic table handlers for kiraganam
  const handleKiraganamChange = (index, field, value) => {
    const newRows = [...kiraganamRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setKiraganamRows(newRows);
  };

  // Dynamic table handlers for kiraganam eye
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

      // For yearly tab, check if all rows have both title and value when one is filled
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

    // Prepare payload based on tab
    if (activeTab === 3) {
      // Yearly - format kiraganam as array of objects
      const formattedKiraganam = kiraganamRows
        .filter(row => row.title && row.value)
        .map(row => ({
          title: row.title,
          value: row.value
        }));

      // Format kiraganam_eye as array of objects
      const formattedKiraganamEye = kiraganamEyeRows
        .filter(row => row.title && row.value)
        .map(row => ({
          title: row.title,
          value: row.value
        }));

      // Update payload with formatted arrays
      payload.kiraganam = formattedKiraganam;
      payload.kiraganam_eye = formattedKiraganamEye;

      // Year name is already in formData, but ensure it's in payload
      if (yearlyLanguage === 'tamil' && yearlyDate.year_name) {
        payload.year_name = yearlyDate.year_name;
      }
    } else if (activeTab === 2) {
      // Monthly - include tamil_month_name if language is Tamil
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
      'https://tnreaders.in/mobile/rasi-daily-store',
      'https://tnreaders.in/mobile/storeweekly',
      'https://tnreaders.in/mobile/storemonthly',
      'https://tnreaders.in/mobile/storeyearly'
    ];
    return endpoints[activeTab];
  };

  const getTabName = () => {
    const names = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
    return names[activeTab];
  };

  // Update formData when language changes
  useEffect(() => {
    if (activeTab === 2) {
      setFormData(prev => ({
        ...prev,
        mon_lan: monthlyLanguage
      }));

      // Reset month selection when language changes
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

        // Add Tamil month name if language is Tamil
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

      // Reset year selection when language changes
      let newYear = yearlyDate.year || new Date().getFullYear().toString();
      let newYearName = yearlyDate.year_name;

      if (yearlyLanguage === 'tamil') {
        // For Tamil, set default year name if not already set
        if (!newYearName) {
          newYearName = 'பரபாவ';
        }
      } else {
        // For English, clear year name
        newYearName = '';
      }

      setYearlyDate({ year: newYear, year_name: newYearName });

      // Update form data
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
        <TextField
          fullWidth
          label="Date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          type="date"
          InputLabelProps={{ shrink: true }}
        />
      );
    } else if (activeTab === 1) {
      return (
        <Grid container spacing={2}>
          {/* Week Navigation */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <IconButton onClick={goToPreviousWeek} color="primary">
                <NavigateBefore />
              </IconButton>
              
              <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
                <Typography variant="h6" color="primary">
                  {getWeekDisplay()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Selected Week Range
                </Typography>
              </Box>
              
              <IconButton onClick={goToNextWeek} color="primary">
                <NavigateNext />
              </IconButton>
            </Box>
          </Grid>

          {/* Sunday Selection Button */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              onClick={openSundayPicker}
              startIcon={<CalendarToday />}
            >
              Select Sunday of the Week
            </Button>
          </Grid>

          {/* Current Selected Week Range (Read-only) */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Week Range (Auto-generated)"
              value={formData.date}
              InputProps={{
                readOnly: true,
              }}
              helperText="Format: YYYY-MM-DD==YYYY-MM-DD"
            />
          </Grid>

          {/* Week Details */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Week Details:
                </Typography>
                {selectedSunday && (
                  <>
                    <Typography variant="body2">
                      <strong>Sunday:</strong> {formatDate(selectedSunday)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Monday:</strong> {formatDate(new Date(selectedSunday.getTime() + 24 * 60 * 60 * 1000))}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Tuesday:</strong> {formatDate(new Date(selectedSunday.getTime() + 2 * 24 * 60 * 60 * 1000))}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Wednesday:</strong> {formatDate(new Date(selectedSunday.getTime() + 3 * 24 * 60 * 60 * 1000))}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Thursday:</strong> {formatDate(new Date(selectedSunday.getTime() + 4 * 24 * 60 * 60 * 1000))}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Friday:</strong> {formatDate(new Date(selectedSunday.getTime() + 5 * 24 * 60 * 60 * 1000))}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Saturday:</strong> {formatDate(getSaturday(selectedSunday))}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Navigation Button */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              onClick={setCurrentWeek}
              startIcon={<CalendarToday />}
            >
              Jump to Current Week
            </Button>
          </Grid>
        </Grid>
      );
    } else if (activeTab === 2) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={monthlyDate.month}
                onChange={(e) => handleMonthlyDateChange('month', e.target.value)}
                label="Month"
              >
                {getCurrentMonths().map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Year"
              value={monthlyDate.year}
              onChange={(e) => handleMonthlyDateChange('year', e.target.value)}
              type="number"
              InputProps={{ inputProps: { min: 2000, max: 2100 } }}
              placeholder="2026"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              Will be sent as: {formData.date || 'Select month and year'}
            </Typography>
          </Grid>
        </Grid>
      );
    } else if (activeTab === 3) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderYearInput()}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="textSecondary">
              Will be sent as: {formData.date || 'Enter year'}
            </Typography>
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Rasi Updates Management
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Daily" />
          <Tab label="Weekly" />
          <Tab label="Monthly" />
          <Tab label="Yearly" />
        </Tabs>

        {/* Language selector for Monthly tab */}
        {activeTab === 2 && (
          <FormControl sx={{ mb: 3, minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={monthlyLanguage}
              onChange={(e) => setMonthlyLanguage(e.target.value)}
              label="Language"
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="tamil">Tamil</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Language selector for Yearly tab */}
        {activeTab === 3 && (
          <FormControl sx={{ mb: 3, minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={yearlyLanguage}
              onChange={(e) => setYearlyLanguage(e.target.value)}
              label="Language"
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="tamil">Tamil</MenuItem>
            </Select>
          </FormControl>
        )}

        <Grid container spacing={3}>
          {/* Rasi Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Rasi *</InputLabel>
              <Select
                value={formData.rasiId}
                onChange={handleRasiChange}
                label="Rasi *"
              >
                {rasiOptions.map((rasi) => (
                  <MenuItem key={rasi.rasiId} value={rasi.rasiId}>
                    {rasi.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Field - Dynamic based on tab */}
          <Grid item xs={12} md={6}>
            {renderDateInput()}
          </Grid>

          {/* Common Fields */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              disabled
              helperText="Auto-filled based on Rasi selection"
            />
          </Grid>

          {/* Tab-specific Fields */}
          {activeTab === 0 && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lucky Numbers"
                  name="luckyNumbers"
                  value={formData.luckyNumbers}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lucky Direction"
                  name="lucky_dr"
                  value={formData.lucky_dr}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lucky Color"
                  name="lucky_color"
                  value={formData.lucky_color}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Summary *"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kiraganam *"
                  name="kiraganam"
                  value={formData.kiraganam}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Weekly Kiraganam"
                  name="weekly_kiraganam"
                  value={formData.weekly_kiraganam}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Advantages"
                  name="advantages"
                  value={formData.advantages}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </>
          )}

          {(activeTab === 2 || activeTab === 3) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mon Lan"
                name="mon_lan"
                value={formData.mon_lan}
                disabled
                helperText={
                  activeTab === 2
                    ? `Auto-filled based on language selection (${monthlyLanguage})`
                    : `Auto-filled based on language selection (${yearlyLanguage})`
                }
              />
            </Grid>
          )}

          {activeTab === 2 && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kiraganam"
                  name="kiraganam"
                  value={formData.kiraganam}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Prayers"
                  name="prayers"
                  value={formData.prayers}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </>
          )}

          {activeTab === 3 && (
            <>
              {/* Dynamic Kiraganam Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Kiraganam Data</Typography>
                      <Button
                        startIcon={<Add />}
                        onClick={addKiraganamRow}
                        variant="outlined"
                        size="small"
                      >
                        Add Row
                      </Button>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {kiraganamRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              <TableCell>{rowIndex + 1}</TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  placeholder="Enter title"
                                  value={row.title || ''}
                                  onChange={(e) => handleKiraganamChange(rowIndex, 'title', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  placeholder="Enter value"
                                  value={row.value || ''}
                                  onChange={(e) => handleKiraganamChange(rowIndex, 'value', e.target.value)}
                                  multiline
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => removeKiraganamRow(rowIndex)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Dynamic Kiraganam Eye Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Kiraganam Eye Data</Typography>
                      <Button
                        startIcon={<Add />}
                        onClick={addKiraganamEyeRow}
                        variant="outlined"
                        size="small"
                      >
                        Add Row
                      </Button>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {kiraganamEyeRows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              <TableCell>{rowIndex + 1}</TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  placeholder="Enter title"
                                  value={row.title || ''}
                                  onChange={(e) => handleKiraganamEyeChange(rowIndex, 'title', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  fullWidth
                                  placeholder="Enter value"
                                  value={row.value || ''}
                                  onChange={(e) => handleKiraganamEyeChange(rowIndex, 'value', e.target.value)}
                                  multiline
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => removeKiraganamEyeRow(rowIndex)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Individual fields */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Other Data:</Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rasi Description"
                  name="rasi_des"
                  value={formData.rasi_des}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Advantages"
                  name="advantages"
                  value={formData.advantages}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prayers"
                  name="prayers"
                  value={formData.prayers}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Category fields - conditionally render based on language */}
              {yearlyLanguage === 'english' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Officers"
                      name="Officers"
                      value={formData.Officers}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Traders"
                      name="Traders"
                      value={formData.Traders}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pengal"
                      name="Pengal"
                      value={formData.Pengal}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Politician"
                      name="politician"
                      value={formData.politician}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Artist"
                      name="artist"
                      value={formData.artist}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Students"
                      name="students"
                      value={formData.students}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Good"
                      name="Good"
                      value={formData.Good}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Attention"
                      name="Attention"
                      value={formData.Attention}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}

              {yearlyLanguage === 'tamil' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Traders (தொழிலதிபர்கள்)"
                      name="Traders"
                      value={formData.Traders}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Officers (அலுவலகத்தினர்)"
                      name="Officers"
                      value={formData.Officers}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Police (காவல்துறையினர்)"
                      name="Police"
                      value={formData.Police}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Politician (அரசியல்வாதிகள்)"
                      name="politician"
                      value={formData.politician}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pengal (மகளிர்)"
                      name="Pengal"
                      value={formData.Pengal}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Students (மாணவர்கள்)"
                      name="students"
                      value={formData.students}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Good (நன்மை)"
                      name="Good"
                      value={formData.Good}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Attention (கவனம்)"
                      name="Attention"
                      value={formData.Attention}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Note (குறிப்பு)"
                      name="Note"
                      value={formData.Note}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                </>
              )}
            </>
          )}

          {/* Common field for all tabs */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Image URL"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Prayers field for Weekly and Monthly */}
          {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prayers"
                name="prayers"
                value={formData.prayers}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          )}

          {/* Advantages for Weekly */}
          {activeTab === 1 && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Advantages"
                name="advantages"
                value={formData.advantages}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSubmit}
            size="large"
          >
            Save {getTabName()} Update
          </Button>
        </Box>
      </Paper>

      {/* Sunday Picker Dialog */}
      <Dialog open={sundayPickerOpen} onClose={() => setSundayPickerOpen(false)}>
        <DialogTitle>Select Sunday Date</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Select Sunday"
            type="date"
            value={sundayPickerDate}
            onChange={(e) => setSundayPickerDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            helperText="Please select a Sunday (day of week should be Sunday)"
            error={sundayPickerDate && !isDateSunday(sundayPickerDate)}
          />
          {sundayPickerDate && !isDateSunday(sundayPickerDate) && (
            <Typography color="error" variant="caption">
              Please select a Sunday. The selected date is not a Sunday.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSundayPickerOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSundayPickerSelect} 
            variant="contained" 
            disabled={sundayPickerDate && !isDateSunday(sundayPickerDate)}
          >
            Select
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RasiUpdateForm;