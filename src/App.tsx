import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Tabs, Tab, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, IconButton, useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PriceData {
  time: number;
  price: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [crypto, setCrypto] = useState<string>('bitcoin');
  const [timeRange, setTimeRange] = useState<string>('1');
  const [currency, setCurrency] = useState<string>('usd');
  const [updateInterval, setUpdateInterval] = useState<number>(300000); // Default to 5 minutes
  const theme = useTheme();

  const fetchCryptoData = async (crypto: string, currency: string, days: string) => {
    try {
      setLoading(true);
      setError(false);

      // CoinGecko APIから時系列データを取得
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart`,
        {
          params: {
            vs_currency: currency, // 選択された通貨
            days, // 選択された期間
          },
        }
      );

      const prices = response.data.prices;
      const formattedData = prices.map(([timestamp, price]: [number, number]) => ({
        time: timestamp,
        price,
      }));

      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    fetchCryptoData(crypto, currency, timeRange);
    const interval = setInterval(() => fetchCryptoData(crypto, currency, timeRange), updateInterval);
    return () => clearInterval(interval); // アンマウント時にクリア
  }, [crypto, currency, timeRange, updateInterval]);

  const handleManualRefresh = () => {
    fetchCryptoData(crypto, currency, timeRange);
  };

  const handleCryptoChange = (event: SelectChangeEvent) => {
    setCrypto(event.target.value); // 選択された暗号通貨を更新
  };

  const handleCurrencyChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value); // 選択された通貨を更新
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTimeRange(newValue); // 選択された期間を更新
  };

  const handleIntervalChange = (event: SelectChangeEvent) => {
    const intervalMapping = {
      '1': 60000, // 1 minute
      '5': 300000, // 5 minutes
      '15': 900000, // 15 minutes
      '30': 1800000, // 30 minutes
      '60': 3600000, // 60 minutes
    };
    setUpdateInterval(intervalMapping[event.target.value as keyof typeof intervalMapping]);
  };

  return (
    <Box
      sx={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        [theme.breakpoints.down('sm')]: {
          padding: '10px',
        },
      }}
    >
      <h1>{crypto.toUpperCase()} Price Data ({currency.toUpperCase()})</h1>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
          },
        }}
      >
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="crypto-select-label">Cryptocurrency</InputLabel>
          <Select
            labelId="crypto-select-label"
            value={crypto}
            onChange={handleCryptoChange}
            label="Cryptocurrency"
          >
            <MenuItem value="bitcoin">Bitcoin</MenuItem>
            <MenuItem value="ethereum">Ethereum</MenuItem>
            <MenuItem value="dogecoin">Dogecoin</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="currency-select-label">Currency</InputLabel>
          <Select
            labelId="currency-select-label"
            value={currency}
            onChange={handleCurrencyChange}
            label="Currency"
          >
            <MenuItem value="usd">USD</MenuItem>
            <MenuItem value="jpy">JPY</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="update-interval-label">Update Interval</InputLabel>
          <Select
            labelId="update-interval-label"
            value={(updateInterval / 60000).toString()}
            onChange={handleIntervalChange}
            label="Update Interval"
          >
            <MenuItem value="1">1 Min</MenuItem>
            <MenuItem value="5">5 Min</MenuItem>
            <MenuItem value="15">15 Min</MenuItem>
            <MenuItem value="30">30 Min</MenuItem>
            <MenuItem value="60">60 Min</MenuItem>
          </Select>
        </FormControl>

        <IconButton onClick={handleManualRefresh} aria-label="Refresh Data">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Tabs 
        value={timeRange} 
        onChange={handleTabChange} 
        indicatorColor="primary" 
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-scrollButtons': {
            '&.Mui-disabled': { opacity: 0.3 }, // 無効化されたボタンのスタイル
          },
        }}
      >
        <Tab label="Last 1 Day" value="1" />
        <Tab label="Last 1 Week" value="7" />
        <Tab label="Last 1 Month" value="30" />
        <Tab label="Last 1 Year" value="365" />
      </Tabs>

      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Failed to fetch data.</p>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={400}
          debounce={1}
        >
          <AreaChart data={data} margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return timeRange === '1'
                  ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) // 時分のみ
                  : date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }); // 月日のみ
              }}
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
            <Legend />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="price" stroke="#8884d8" fill="url(#colorPrice)"/>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default App;
