"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Badge } from "@/src/app/components/ui/badge";
import { Progress } from "@/src/app/components/ui/progress";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Calendar, Plus, Trash2, CheckCircle, XCircle, TrendingUp, Target, RotateCcw, Download, AlertTriangle } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  streak: number;
  longestStreak: number;
  totalDays: number;
  completedDates: string[];
  createdAt: Date;
}

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");

  const colors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ];

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      try {
        const parsedHabits = JSON.parse(savedHabits).map((habit: any) => ({
          ...habit,
          createdAt: new Date(habit.createdAt)
        }));
        setHabits(parsedHabits);
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    }
  }, []);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) {
      setError("Please enter a habit name");
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      description: newHabitDescription.trim(),
      color,
      streak: 0,
      longestStreak: 0,
      totalDays: 0,
      completedDates: [],
      createdAt: new Date()
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitName("");
    setNewHabitDescription("");
    setSelectedColor("#3b82f6");
    setShowAddForm(false);
    setError("");
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isCompletedToday = habit.completedDates.includes(today);
        let newCompletedDates = [...habit.completedDates];
        
        if (isCompletedToday) {
          // Remove today's completion
          newCompletedDates = newCompletedDates.filter(date => date !== today);
        } else {
          // Add today's completion
          newCompletedDates.push(today);
        }

        // Calculate new streak
        const newStreak = calculateStreak(newCompletedDates);
        const newLongestStreak = Math.max(habit.longestStreak, newStreak);

        return {
          ...habit,
          completedDates: newCompletedDates,
          streak: newStreak,
          longestStreak: newLongestStreak,
          totalDays: newCompletedDates.length
        };
      }
      return habit;
    }));
  };

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;

    const sortedDates = completedDates.sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) { // Check up to a year
      const dateString = currentDate.toISOString().split('T')[0];
      
      if (sortedDates.includes(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const isCompletedToday = (habit: Habit): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  };

  const getCompletionRate = (habit: Habit): number => {
    const daysSinceCreation = Math.ceil((Date.now() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreation > 0 ? (habit.totalDays / daysSinceCreation) * 100 : 0;
  };

  const exportData = () => {
    const data = {
      habits: habits.map(habit => ({
        ...habit,
        createdAt: habit.createdAt.toISOString()
      })),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all habit data? This action cannot be undone.")) {
      setHabits([]);
      localStorage.removeItem('habits');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Habit Tracker</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Log daily habits and view streaks to build better routines
          </p>
        </div>

        {/* Add Habit Form */}
        <Card className="card-enhanced mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>Add New Habit</span>
            </CardTitle>
            <CardDescription>
              Create a new habit to track
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <Button
                onClick={() => setShowAddForm(true)}
                className="btn-enhanced hover-lift"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Habit Name</label>
                    <Input
                      placeholder="e.g., Exercise, Read, Meditate"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <div className="flex gap-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === color ? 'border-gray-800 dark:border-gray-200' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Describe your habit..."
                    value={newHabitDescription}
                    onChange={(e) => setNewHabitDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={addHabit}
                    className="btn-enhanced hover-lift"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Habit
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewHabitName("");
                      setNewHabitDescription("");
                      setError("");
                    }}
                    variant="outline"
                    className="hover-lift"
                  >
                    Cancel
                  </Button>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <Card className="card-enhanced">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building better habits by adding your first one
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="btn-enhanced hover-lift"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {habits.map(habit => (
              <Card key={habit.id} className="card-enhanced">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <CardTitle className="text-lg">{habit.name}</CardTitle>
                    </div>
                    <Button
                      onClick={() => deleteHabit(habit.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover-lift"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {habit.description && (
                    <CardDescription className="text-sm">
                      {habit.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Completion Button */}
                  <Button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    variant={isCompletedToday(habit) ? "default" : "outline"}
                    className={`w-full hover-lift ${
                      isCompletedToday(habit) ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    {isCompletedToday(habit) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed Today
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{habit.streak}</div>
                      <div className="text-xs text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{habit.longestStreak}</div>
                      <div className="text-xs text-muted-foreground">Best Streak</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>{getCompletionRate(habit).toFixed(1)}%</span>
                    </div>
                    <Progress value={getCompletionRate(habit)} className="h-2" />
                  </div>

                  {/* Total Days */}
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-sm font-medium">{habit.totalDays}</div>
                    <div className="text-xs text-muted-foreground">Total Days Completed</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {habits.length > 0 && (
          <Card className="card-enhanced mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{habits.length}</div>
                  <div className="text-sm text-muted-foreground">Total Habits</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {habits.filter(habit => isCompletedToday(habit)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Today</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(...habits.map(h => h.streak))}
                  </div>
                  <div className="text-sm text-muted-foreground">Best Current Streak</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.max(...habits.map(h => h.longestStreak))}
                  </div>
                  <div className="text-sm text-muted-foreground">All-Time Best</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {habits.length > 0 && (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="hover-lift"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  onClick={clearAllData}
                  variant="outline"
                  className="hover-lift text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 