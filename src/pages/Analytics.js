import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { identifyUnderutilized, calculateAdjustedCostPerWear } from '../services/analyticsLogic';
import { formatINR } from '../utils/currency';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [underutilized, setUnderutilized] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const snap = await getDocs(collection(db, 'users', userId, 'wardrobe'));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWardrobe(items);
      const under = identifyUnderutilized(items, 30);
      setUnderutilized(under);
      setLoading(false);
    };
    load();
  }, [userId]);

  const byCategory = wardrobe.reduce((acc, item) => {
    const cat = item.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const wearCountData = wardrobe
    .filter((i) => (i.wearCount ?? 0) > 0)
    .sort((a, b) => (b.wearCount ?? 0) - (a.wearCount ?? 0))
    .slice(0, 10);

  const chartData = {
    labels: Object.keys(byCategory),
    datasets: [
      {
        label: 'Items per category',
        data: Object.values(byCategory),
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const wearChartData = {
    labels: wearCountData.map((i) => i.name || i.category || 'Item'),
    datasets: [
      {
        label: 'Wear count',
        data: wearCountData.map((i) => i.wearCount ?? 0),
        backgroundColor: 'rgba(118, 75, 162, 0.6)',
        borderColor: 'rgba(118, 75, 162, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Wardrobe by category' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const wearChartOptions = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top 10 most worn items' },
    },
    scales: {
      x: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  if (loading) return <div className="page-loading">Loading analytics...</div>;

  return (
    <div className="recommendations-page">
      <div className="form-container">
        <div className="form-card">
          <h1 className="form-title">📊 Analytics</h1>
          <p className="form-subtitle">Rule-based insights: utilization and cost per wear.</p>

          <div className="analytics-grid analytics-grid-themed">
            <div className="analytics-panel">
              <h2 className="analytics-panel-title">Wardrobe by category</h2>
              <p className="analytics-panel-desc">
                See where you may be overbuying (tall bars) or under-investing.
              </p>
              {Object.keys(byCategory).length === 0 ? (
                <p className="empty-state">Add items in My Wardrobe to see charts.</p>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
            <div className="analytics-panel">
              <h2 className="analytics-panel-title">Most worn items</h2>
              <p className="analytics-panel-desc">
                Your real workhorses — repeat winners and pause on what you rarely wear.
              </p>
              {wearCountData.length === 0 ? (
                <p className="empty-state">Log outfits to see wear counts.</p>
              ) : (
                <Bar data={wearChartData} options={wearChartOptions} />
              )}
            </div>
          </div>

          <div className="analytics-panel analytics-panel-full underutilized-themed">
            <h2 className="analytics-panel-title">Underutilized items</h2>
            <p className="analytics-panel-desc">Not worn in 30+ days and fewer than 3 wears — wear more or declutter.</p>
            {underutilized.length === 0 ? (
              <p className="empty-state">No underutilized items found.</p>
            ) : (
              <ul className="underutilized-list">
                {underutilized.map((item) => (
                  <li key={item.id}>
                    {item.name || item.category} – {item.color} – worn {item.wearCount ?? 0} times – CPW:{' '}
                    {formatINR(
                      calculateAdjustedCostPerWear(item.purchasePrice ?? 0, item.wearCount ?? 0),
                      { maximumFractionDigits: 0 }
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
