import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { 
  Activity, 
  Apple, 
  Brain, 
  Heart, 
  Plus, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Bell
} from 'lucide-react'
import './App.css'
import { listFoods, addFoodApi, listSymptoms, addSymptomApi, getInsights, seedDemo, exportCSV } from '@/lib/api.js'

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [foodEntry, setFoodEntry] = useState('')
  const [symptomEntry, setSymptomEntry] = useState('')
  const [symptoms, setSymptoms] = useState([])
  const [foods, setFoods] = useState([])
  const [triangleScores, _setTriangleScores] = useState({
    digestive: 75,
    bloodSugar: 60,
    adrenal: 80
  })

  // Sample data for demonstration
  const [todaysSymptoms] = useState([
    { name: 'Bloating', severity: 3, time: '2:30 PM' },
    { name: 'Energy Crash', severity: 2, time: '4:00 PM' }
  ])

  const [recentFoods] = useState([
    { name: 'Grilled Chicken Salad', time: '12:30 PM', feeling: 'Energized' },
    { name: 'Greek Yogurt', time: '3:00 PM', feeling: 'Satisfied' }
  ])

  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addFood = async () => {
    if (!foodEntry.trim()) return
    const payload = {
      name: foodEntry.trim(),
      time: new Date().toISOString(),
      feeling: 'Not rated'
    }
    try {
      const item = await addFoodApi(payload)
      setFoods(prev => [item, ...prev])
      setFoodEntry('')
    } catch (err) {
      console.error('Failed to add food', err)
      setError('Failed to add food')
    }
  }

  const addSymptom = async () => {
    if (!symptomEntry.trim()) return
    const payload = {
      name: symptomEntry.trim(),
      severity: 3,
      time: new Date().toISOString()
    }
    try {
      const item = await addSymptomApi(payload)
      setSymptoms(prev => [item, ...prev])
      setSymptomEntry('')
    } catch (err) {
      console.error('Failed to add symptom', err)
      setError('Failed to add symptom')
    }
  }

  const refreshAll = async () => {
    const [f, s, inz] = await Promise.all([
      listFoods(),
      listSymptoms(),
      getInsights(),
    ])
    setFoods(f)
    setSymptoms(s)
    setInsights(inz)
  }

  const onSeedDemo = async () => {
    setLoading(true); setError('')
    try {
      await seedDemo()
      await refreshAll()
    } catch (e) {
      console.error(e)
      setError('Failed to seed demo data')
    } finally {
      setLoading(false)
    }
  }

  const onExportCSV = async () => {
    setLoading(true); setError('')
    try {
      const blob = await exportCSV()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'triangle-health-export.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      setError('Failed to export CSV')
    } finally {
      setLoading(false)
    }
  }

  // Simulate periodic reminders
  useEffect(() => {
    // Initial data load from APIs
    (async () => {
      try {
        await refreshAll()
      } catch (e) {
        console.warn('Initial data load failed', e)
      }
    })()

    const interval = setInterval(() => {
      // This would trigger notifications in a real app
      console.log('Reminder: How are you feeling? Log any symptoms you\'re experiencing.')
    }, 300000) // Every 5 minutes for demo (would be longer in real app)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Triangle of Health</h1>
          <p className="text-gray-600">Track your food, symptoms, and discover the connections</p>
        </div>

        {/* Actions toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 justify-between">
          <div className="flex gap-2">
            <Button onClick={onSeedDemo} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              Seed Demo Data
            </Button>
            <Button onClick={onExportCSV} disabled={loading} variant="outline">
              Export CSV
            </Button>
          </div>
          {loading && (
            <span className="text-sm text-gray-600">Working...</span>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="log">Log Food</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Triangle Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-100 to-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Digestive Health</CardTitle>
                  <Apple className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{triangleScores.digestive}%</div>
                  <Progress value={triangleScores.digestive} className="mt-2" />
                  <p className="text-xs text-green-600 mt-2">Good progress this week</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-100 to-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Sugar Stability</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">{triangleScores.bloodSugar}%</div>
                  <Progress value={triangleScores.bloodSugar} className="mt-2" />
                  <p className="text-xs text-blue-600 mt-2">Room for improvement</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-100 to-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Adrenal-Thyroid</CardTitle>
                  <Heart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">{triangleScores.adrenal}%</div>
                  <Progress value={triangleScores.adrenal} className="mt-2" />
                  <p className="text-xs text-purple-600 mt-2">Excellent balance</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Food Entries (Last 7 Days)</CardTitle>
                  <CardDescription>Track how consistently you log your meals</CardDescription>
                </CardHeader>
                <CardContent style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={(() => {
                      const map = new Map()
                      const now = new Date()
                      for (let i = 6; i >= 0; i--) {
                        const d = new Date(now)
                        d.setDate(now.getDate() - i)
                        const key = `${d.getMonth()+1}/${d.getDate()}`
                        map.set(key, 0)
                      }
                      for (const f of foods) {
                        const d = new Date(f.time)
                        if (isNaN(d)) continue
                        const key = `${d.getMonth()+1}/${d.getDate()}`
                        if (map.has(key)) map.set(key, (map.get(key) || 0) + 1)
                      }
                      return Array.from(map, ([day, count]) => ({ day, count }))
                    })()}>
                      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <ReTooltip />
                      <Bar dataKey="count" fill="#3CAADF" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg Symptom Severity (Last 7 Days)</CardTitle>
                  <CardDescription>Higher bars indicate tougher days</CardDescription>
                </CardHeader>
                <CardContent style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={(
                      () => {
                        const map = new Map()
                        const cnt = new Map()
                        const now = new Date()
                        for (let i = 6; i >= 0; i--) {
                          const d = new Date(now)
                          d.setDate(now.getDate() - i)
                          const key = `${d.getMonth()+1}/${d.getDate()}`
                          map.set(key, 0); cnt.set(key, 0)
                        }
                        for (const s of symptoms) {
                          const d = new Date(s.time)
                          if (isNaN(d)) continue
                          const key = `${d.getMonth()+1}/${d.getDate()}`
                          if (map.has(key)) {
                            map.set(key, (map.get(key) || 0) + (Number(s.severity)||0))
                            cnt.set(key, (cnt.get(key) || 0) + 1)
                          }
                        }
                        return Array.from(map, ([day, sum]) => {
                          const c = cnt.get(day) || 0
                          return { day, avg: c ? Number((sum/c).toFixed(2)) : 0 }
                        })
                      }
                    )()}>
                      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0,5]} allowDecimals />
                      <ReTooltip />
                      <Line type="monotone" dataKey="avg" stroke="#F58A34" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Today's Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Today's Food Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentFoods.map((food, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-500">{food.time}</p>
                      </div>
                      <Badge variant="outline">{food.feeling}</Badge>
                    </div>
                  ))}
                  {foods.map((food, index) => (
                    <div key={food.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-500">{(() => { try { return new Date(food.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return String(food.time || '') } })()}</p>
                      </div>
                      <Badge variant="outline">{food.feeling}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Today's Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todaysSymptoms.map((symptom, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{symptom.name}</p>
                        <p className="text-sm text-gray-500">{symptom.time}</p>
                      </div>
                      <Badge variant={symptom.severity > 3 ? "destructive" : "secondary"}>
                        Level {symptom.severity}
                      </Badge>
                    </div>
                  ))}
                  {symptoms.map((symptom, index) => (
                    <div key={symptom.id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{symptom.name}</p>
                        <p className="text-sm text-gray-500">{(() => { try { return new Date(symptom.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return String(symptom.time || '') } })()}</p>
                      </div>
                      <Badge variant={symptom.severity > 3 ? "destructive" : "secondary"}>
                        Level {symptom.severity}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Reminder Card */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Bell className="h-5 w-5" />
                  Periodic Check-in Reminder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600 mb-3">
                  How are you feeling right now? Remember, food effects can be immediate or take up to 24 hours to appear.
                </p>
                <Button 
                  onClick={() => setCurrentTab('symptoms')} 
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Log Current Symptoms
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Food Logging Tab */}
          <TabsContent value="log" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Log Your Food</CardTitle>
                <CardDescription>
                  Track what you eat and how it makes you feel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="food">What did you eat?</Label>
                  <Input
                    id="food"
                    placeholder="e.g., Grilled salmon with vegetables"
                    value={foodEntry}
                    onChange={(e) => setFoodEntry(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFood()}
                  />
                </div>
                <Button onClick={addFood} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food Entry
                </Button>
              </CardContent>
            </Card>

            {/* Quick Feeling Tags */}
            <Card>
              <CardHeader>
                <CardTitle>How did it make you feel?</CardTitle>
                <CardDescription>
                  Tag your immediate response to the food
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Energized', 'Sluggish', 'Bloated', 'Brain Fog', 'Satisfied', 'Still Hungry'].map((feeling) => (
                    <Badge key={feeling} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {feeling}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Symptoms Tab */}
          <TabsContent value="symptoms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Log Symptoms</CardTitle>
                <CardDescription>
                  Track how you're feeling throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptom">What symptom are you experiencing?</Label>
                  <Input
                    id="symptom"
                    placeholder="e.g., Bloating, Fatigue, Headache"
                    value={symptomEntry}
                    onChange={(e) => setSymptomEntry(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  />
                </div>
                <Button onClick={addSymptom} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Symptom
                </Button>
              </CardContent>
            </Card>

            {/* Common Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle>Common Symptoms</CardTitle>
                <CardDescription>
                  Quick-add common symptoms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'Bloating', 'Fatigue', 'Headache', 'Brain Fog', 
                    'Skin Issues', 'Sugar Cravings', 'Anxiety', 'Constipation',
                    'Diarrhea', 'Joint Pain', 'Mood Swings', 'Sleep Issues'
                  ].map((symptom) => (
                    <Button 
                      key={symptom} 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const item = await addSymptomApi({ name: symptom, severity: 3, time: new Date().toISOString() })
                          setSymptoms(prev => [item, ...prev])
                        } catch (e) {
                          console.error('Quick-add symptom failed', e)
                        }
                      }}
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Health Insights
                </CardTitle>
                <CardDescription>
                  Discover patterns between your food and symptoms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-blue-800">{insight}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Educational Content */}
            <Card>
              <CardHeader>
                <CardTitle>Learn About the Triangle of Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Digestive System</h3>
                    <p className="text-sm text-green-700">
                      Learn about gut health, toxicity, and how your digestive system affects overall wellness.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Blood Sugar</h3>
                    <p className="text-sm text-blue-700">
                      Understand how blood sugar stability impacts energy, mood, and long-term health.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Adrenal-Thyroid</h3>
                    <p className="text-sm text-purple-700">
                      Discover how stress response and hormones influence your daily well-being.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

