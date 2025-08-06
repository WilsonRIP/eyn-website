"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Progress } from "@/src/app/components/ui/progress";
import { Badge } from "@/src/app/components/ui/badge";
import { Timer, Play, Pause, RotateCcw, Settings, CheckCircle, Coffee } from "lucide-react";

type TimerMode = 'work' | 'break' | 'longBreak';

interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export default function PomodoroPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      setCompletedSessions(prev => prev + 1);
      
      // Check if it's time for a long break
      if ((completedSessions + 1) % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakMinutes * 60);
      } else {
        setMode('break');
        setTimeLeft(settings.breakMinutes * 60);
      }
    } else {
      // Break completed, start work session
      setMode('work');
      setTimeLeft(settings.workMinutes * 60);
    }

    // Play notification sound (if supported)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: `${mode === 'work' ? 'Work session completed! Time for a break.' : 'Break completed! Time to work.'}`,
        icon: '/favicon.ico',
      });
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings.workMinutes * 60);
    setMode('work');
  };

  const skipTimer = () => {
    handleTimerComplete();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = mode === 'work' 
      ? settings.workMinutes * 60 
      : mode === 'break' 
        ? settings.breakMinutes * 60 
        : settings.longBreakMinutes * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeColor = (): string => {
    switch (mode) {
      case 'work': return 'bg-red-500';
      case 'break': return 'bg-green-500';
      case 'longBreak': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'work': return <Timer className="h-6 w-6" />;
      case 'break': 
      case 'longBreak': return <Coffee className="h-6 w-6" />;
      default: return <Timer className="h-6 w-6" />;
    }
  };

  const getModeTitle = (): string => {
    switch (mode) {
      case 'work': return 'Work Session';
      case 'break': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Work Session';
    }
  };

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Update current timer if not running
    if (!isRunning) {
      if (mode === 'work') {
        setTimeLeft(updatedSettings.workMinutes * 60);
      } else if (mode === 'break') {
        setTimeLeft(updatedSettings.breakMinutes * 60);
      } else {
        setTimeLeft(updatedSettings.longBreakMinutes * 60);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Pomodoro Timer</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Simple timer to boost focus with work/break cycles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <Card className="card-enhanced">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {getModeIcon()}
                  <span>{getModeTitle()}</span>
                  <Badge variant="secondary">{completedSessions} completed</Badge>
                </CardTitle>
                <CardDescription>
                  {mode === 'work' 
                    ? 'Stay focused and productive' 
                    : 'Take a well-deserved break'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timer Display */}
                <div className="text-center">
                  <div className={`text-8xl font-mono font-bold ${getModeColor()} bg-clip-text text-transparent bg-gradient-to-r from-current to-current/70`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={getProgress()} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(getProgress())}%</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  {!isRunning ? (
                    <Button
                      onClick={startTimer}
                      size="lg"
                      className="btn-enhanced hover-lift"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTimer}
                      size="lg"
                      variant="outline"
                      className="hover-lift"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                    className="hover-lift"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                  
                  <Button
                    onClick={skipTimer}
                    size="lg"
                    variant="outline"
                    className="hover-lift"
                  >
                    Skip
                  </Button>
                </div>

                {/* Session Info */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Session {completedSessions + 1} of {settings.longBreakInterval}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mode === 'work' 
                      ? `Next: ${(completedSessions + 1) % settings.longBreakInterval === 0 ? 'Long Break' : 'Short Break'}`
                      : 'Next: Work Session'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </CardTitle>
                <CardDescription>
                  Customize your timer settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workMinutes">Work Duration (minutes)</Label>
                  <Input
                    id="workMinutes"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workMinutes}
                    onChange={(e) => updateSettings({ workMinutes: parseInt(e.target.value) || 25 })}
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breakMinutes">Break Duration (minutes)</Label>
                  <Input
                    id="breakMinutes"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.breakMinutes}
                    onChange={(e) => updateSettings({ breakMinutes: parseInt(e.target.value) || 5 })}
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longBreakMinutes">Long Break Duration (minutes)</Label>
                  <Input
                    id="longBreakMinutes"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.longBreakMinutes}
                    onChange={(e) => updateSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })}
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longBreakInterval">Long Break Interval (sessions)</Label>
                  <Input
                    id="longBreakInterval"
                    type="number"
                    min="2"
                    max="10"
                    value={settings.longBreakInterval}
                    onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) || 4 })}
                    disabled={isRunning}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="card-enhanced mt-6">
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Sessions</span>
                  <Badge variant="outline">{completedSessions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Work Time</span>
                  <span className="text-sm font-medium">
                    {Math.floor((completedSessions * settings.workMinutes) / 60)}h {(completedSessions * settings.workMinutes) % 60}m
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Break Time</span>
                  <span className="text-sm font-medium">
                    {Math.floor((completedSessions * settings.breakMinutes) / 60)}h {(completedSessions * settings.breakMinutes) % 60}m
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>How to Use the Pomodoro Technique</CardTitle>
            <CardDescription>
              Maximize your productivity with focused work sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Work Session</h3>
                <p className="text-sm text-muted-foreground">
                  Focus on a single task for 25 minutes without interruptions. Eliminate distractions and maintain concentration.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">2. Take Breaks</h3>
                <p className="text-sm text-muted-foreground">
                  After each work session, take a 5-minute break to rest your mind. Every 4 sessions, take a longer 15-minute break.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">3. Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your completed sessions and total work time. Celebrate your progress and maintain consistency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 