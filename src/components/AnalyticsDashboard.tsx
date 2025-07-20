import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { format } from 'date-fns'

interface AnalyticsData {
  learningProgress: Array<{
    date: string
    xp: number
    questionsAnswered: number
    accuracy: number
  }>
  skillMastery: Array<{
    skill: string
    knowledge: number
    attempts: number
  }>
  timeDistribution: Array<{
    name: string
    value: number
  }>
  bloomLevels: Array<{
    level: string
    mastery: number
  }>
  streakHistory: Array<{
    date: string
    completed: boolean
  }>
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
  totalXP: number
  currentStreak: number
  accuracy: number
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981']

export default function AnalyticsDashboard({
  data,
  totalXP,
  currentStreak,
  accuracy,
}: AnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <h3 className="text-sm text-gray-600 mb-1">Total XP</h3>
          <p className="text-3xl font-bold gradient-text">{totalXP}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <h3 className="text-sm text-gray-600 mb-1">Current Streak</h3>
          <p className="text-3xl font-bold text-orange-600">{currentStreak} 🔥</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <h3 className="text-sm text-gray-600 mb-1">Accuracy</h3>
          <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <h3 className="text-sm text-gray-600 mb-1">Skills Mastered</h3>
          <p className="text-3xl font-bold text-purple-600">
            {data.skillMastery.filter(s => s.knowledge > 0.85).length}
          </p>
        </motion.div>
      </div>

      {/* Learning Progress Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-bold mb-4">Learning Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.learningProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="xp"
              stroke="#6366f1"
              name="XP Earned"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              stroke="#10b981"
              name="Accuracy %"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Mastery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-bold mb-4">Skill Mastery</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.skillMastery} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 1]} />
              <YAxis dataKey="skill" type="category" width={100} />
              <Tooltip formatter={(value: number) => `${(value * 100).toFixed(0)}%`} />
              <Bar dataKey="knowledge" fill="#6366f1">
                {data.skillMastery.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.knowledge > 0.85 ? '#10b981' : entry.knowledge > 0.5 ? '#6366f1' : '#f59e0b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bloom's Taxonomy Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-bold mb-4">Bloom&apos;s Taxonomy Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.bloomLevels}>
              <PolarGrid />
              <PolarAngleAxis dataKey="level" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar 
                name="Mastery" 
                dataKey="mastery" 
                stroke="#6366f1" 
                fill="#6366f1" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Time Distribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-bold mb-4">Learning Time Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.timeDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.timeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Streak Calendar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h3 className="text-lg font-bold mb-4">Streak Calendar</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-gray-600 font-medium">
              {day}
            </div>
          ))}
          {data.streakHistory.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                day.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
              title={day.date}
            >
              {format(new Date(day.date), 'd')}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}