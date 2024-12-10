import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Tabs, Tab, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

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

  const fetchBitcoinData = async (crypto: string, currency: string, days: string) => {
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
    fetchBitcoinData(crypto, currency, timeRange);
    const interval = setInterval(fetchBitcoinData, 300000); // 5分ごとにデータ更新
    return () => clearInterval(interval); // アンマウント時にクリア
  }, [crypto, currency, timeRange]);

  const handleCryptoChange = (event: SelectChangeEvent) => {
    setCrypto(event.target.value); // 選択された暗号通貨を更新
  };

  const handleCurrencyChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value); // 選択された通貨を更新
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTimeRange(newValue); // 選択された期間を更新
  };

  return (
    <Box sx={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{crypto.toUpperCase()} Price Data ({currency.toUpperCase()})</h1>
      <FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
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

      <FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
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

      <Tabs 
        value={timeRange} 
        onChange={handleTabChange} 
        indicatorColor="primary" 
        textColor="primary"
        centered
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
        <ResponsiveContainer width="100%" height={400}>
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
            <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString('en-US') + ' ' + new Date(value).toLocaleTimeString('en-US')} />
            <Legend />
            <Area type="monotone" dataKey="price" stroke="#8884d8" fill="#8884d8"/>
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default App;
