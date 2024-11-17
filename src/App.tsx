import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, Brush, CartesianGrid, ResponsiveContainer } from 'recharts';

interface PriceData {
  time: number;
  price: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchBitcoinData = async () => {
    try {
      // CoinGecko APIからビットコインの時系列データを取得
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
        {
          params: {
            vs_currency: 'usd', // USD建て
            days: '1',          // 過去1日間のデータ
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
      setError(false);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    fetchBitcoinData();
    const interval = setInterval(fetchBitcoinData, 300000); // 5分ごとにデータ更新
    return () => clearInterval(interval); // アンマウント時にクリア
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ビットコイン価格データ (USD, 過去24時間)</h1>
      {loading ? (
        <p>データを読み込んでいます...</p>
      ) : error ? (
        <p>データの取得に失敗しました。</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} // タイムスタンプを時間表示に変換
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip labelFormatter={(value) => new Date(value).toLocaleTimeString()} />
            <Legend />
            <Brush />
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default App;
