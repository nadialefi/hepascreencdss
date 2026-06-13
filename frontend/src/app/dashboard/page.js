'use client';
import { useEffect, useState } from 'react';
import { Activity, User, ClipboardList, ShieldAlert, Droplets, HeartPulse } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '@/lib/api';

export default function DashboardHome() {
  // Safelist for dynamic Tailwind text colors used in statCards
  // text-blue-500 text-medical-500 text-emerald-500 text-amber-500 text-orange-500 text-red-500
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-medical-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Pasien', value: stats.totalPatients, icon: User, color: 'bg-blue-500' },
    { title: 'Total Pemeriksaan', value: stats.totalExaminations, icon: ClipboardList, color: 'bg-medical-500' },
    { title: 'Blood Donor', value: stats.bloodDonorCases, icon: Droplets, color: 'bg-emerald-500' },
    { title: 'Hepatitis', value: stats.hepatitisCases, icon: ShieldAlert, color: 'bg-amber-500' },
    { title: 'Fibrosis', value: stats.fibrosisCases, icon: Activity, color: 'bg-orange-500' },
    { title: 'Cirrhosis', value: stats.cirrhosisCases, icon: HeartPulse, color: 'bg-red-500' },
  ];

  const pieData = [
    { name: 'Blood Donor', value: stats.bloodDonorCases, color: '#10b981' },
    { name: 'Hepatitis', value: stats.hepatitisCases, color: '#f59e0b' },
    { name: 'Fibrosis', value: stats.fibrosisCases, color: '#f97316' },
    { name: 'Cirrhosis', value: stats.cirrhosisCases, color: '#ef4444' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Selamat Datang di HepaScreen CDSS</h2>
        <p className="text-slate-600 mt-2">
          Sistem Pendukung Keputusan Klinis untuk deteksi dini Hepatitis C menggunakan Machine Learning.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="group bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col items-center text-center cursor-pointer hover:border-medical-300 transition-all hover:shadow-md">
              <div className={`p-3 rounded-full ${stat.color} mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Distribusi Hasil Prediksi</h3>
          <div className="flex-grow min-h-[250px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Belum ada data prediksi.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Aktivitas Terbaru</h3>
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Waktu</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pasien (MRN)</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Hasil</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {stats.recentActivities.map((activity, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        {new Date(activity.created_at + 'Z').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {activity.patient?.name} <span className="text-slate-500 font-normal">({activity.patient?.medical_record_number})</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${activity.prediction_result === 'Blood Donor' ? 'bg-emerald-100 text-emerald-800' :
                            activity.prediction_result === 'Hepatitis' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {activity.prediction_result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              Belum ada aktivitas pemeriksaan yang tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
