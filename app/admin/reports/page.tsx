"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileBarChart2, BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  
  // Dummy data - in a real app this would come from an API
  const assessmentData = [
    { name: "Literacy", completed: 82, total: 100 },
    { name: "Numeracy", completed: 67, total: 100 },
    { name: "Cognitive", completed: 93, total: 100 },
    { name: "Motor Skills", completed: 78, total: 100 },
    { name: "Language", completed: 85, total: 100 },
  ];
  
  const pieData = [
    { name: "Excellent", value: 35, color: "#3B82F6" },
    { name: "Good", value: 45, color: "#10B981" },
    { name: "Average", value: 15, color: "#F59E0B" },
    { name: "Needs Improvement", value: 5, color: "#EF4444" },
  ];
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const calculatedData = assessmentData.map(item => ({
    ...item,
    percentage: Math.round((item.completed / item.total) * 100)
  }));

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FileBarChart2 className="mr-3 h-8 w-8 text-indigo-600" />
          Assessment Reports
        </h1>
        <p className="text-gray-600 ml-11">View assessment performance and statistics</p>
      </div>

      {loading ? (
        <div className="h-64 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Assessment Completion Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
              Assessment Completion Rates
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calculatedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                  <Bar dataKey="percentage" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {calculatedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.percentage > 80 ? '#10B981' : entry.percentage > 60 ? '#3B82F6' : '#F59E0B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
              Performance Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Summary statistics */}
          <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Assessment Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Area
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessmentData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                (item.completed / item.total) > 0.8 
                                  ? 'bg-green-500' 
                                  : (item.completed / item.total) > 0.6 
                                    ? 'bg-blue-500' 
                                    : 'bg-amber-500'
                              }`} 
                              style={{ width: `${(item.completed / item.total) * 100}%` }}
                            ></div>
                          </div>
                          <span>{Math.round((item.completed / item.total) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 