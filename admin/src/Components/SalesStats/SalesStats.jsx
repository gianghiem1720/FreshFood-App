import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import './SalesStats.css';

const SalesStats = () => {
    const [stats, setStats] = useState([]);
    const [chartType, setChartType] = useState('revenue'); // Mặc định hiển thị biểu đồ doanh thu

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`http://localhost:4000/sales-stats?type=${chartType}`);
                const data = await response.json();
                console.log('Fetched data:', data);
                if (Array.isArray(data)) {
                    setStats(data);
                } else {
                    console.error('Fetched data is not in expected format:', data);
                }
            } catch (error) {
                console.error('Error fetching sales statistics:', error);
            }
        };
        fetchStats();
    }, [chartType]);

    const formatMonth = (month) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[month - 1];
    };

    return (
        <div className="sales-stats">
            <h1>Sales Statistics</h1>
            <div className="button-group">
                <button onClick={() => setChartType('revenue')}>Doanh thu</button>
                <button onClick={() => setChartType('orders')}>Tổng đơn hàng</button>
            </div>
            <BarChart
                width={800}
                height={400}
                data={chartType === 'orders' ? stats.map(stat => ({ ...stat, month: formatMonth(stat.month) })) : stats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartType === 'orders' ? 'month' : 'product_name'} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                    dataKey={chartType === 'revenue' ? 'total_revenue' : 'total_orders'}
                    name={chartType === 'revenue' ? 'Tổng tiền đã thu được' : 'Tổng số đơn hàng'}
                    fill={chartType === 'revenue' ? '#82ca9d' : '#8884d8'}
                />
            </BarChart>
        </div>
    );
};

export default SalesStats;
