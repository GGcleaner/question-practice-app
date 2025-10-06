import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/lib/storage';
import { StudyProgress, DailyRecord } from '@/types';
import { BookOpen, Zap, CheckCircle2, XCircle, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [progress, setProgress] = useState<StudyProgress>({
    totalQuestions: 0,
    answeredQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracy: 0,
  });
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<DailyRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const banks = storage.getQuestionBanks();
    const answers = storage.getUserAnswers();
    const totalQuestions = banks.reduce((sum, bank) => sum + bank.questions.length, 0);
    
    const uniqueAnswered = new Set(answers.map(a => a.questionId)).size;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const wrongAnswers = answers.filter(a => !a.isCorrect).length;
    const accuracy = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0;

    setProgress({
      totalQuestions,
      answeredQuestions: uniqueAnswered,
      correctAnswers,
      wrongAnswers,
      accuracy,
    });

    setTodayRecord(storage.getTodayRecord());
    
    const allRecords = storage.getDailyRecords();
    setRecentRecords(allRecords.slice(-7).reverse());
  };

  const stats = [
    {
      title: '题库总量',
      value: progress.totalQuestions,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: '已做题目',
      value: progress.answeredQuestions,
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: '答对题数',
      value: progress.correctAnswers,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: '答错题数',
      value: progress.wrongAnswers,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-white shadow-strong">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">欢迎回来！</h1>
          <p className="text-white/90 mb-6">继续你的学习之旅，每天进步一点点</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/practice">
              <Button size="lg" variant="secondary">
                <Zap className="mr-2 h-5 w-5" />
                快速刷题
              </Button>
            </Link>
            <Link to="/exam">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                模拟考试
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-white/10 rounded-full -mb-20" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accuracy & Today's Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              总体正确率
            </CardTitle>
            <CardDescription>你的答题准确度</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold text-primary">
              {progress.accuracy.toFixed(1)}%
            </div>
            <Progress value={progress.accuracy} className="h-3" />
            <p className="text-sm text-muted-foreground">
              继续保持！目标是达到90%以上
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-success" />
              今日打卡
            </CardTitle>
            <CardDescription>今天的学习记录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">答题数</span>
              <span className="text-2xl font-bold text-success">
                {todayRecord?.questionsAnswered || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">正确数</span>
              <span className="text-lg font-semibold">
                {todayRecord?.correctAnswers || 0}
              </span>
            </div>
            {!todayRecord && (
              <p className="text-sm text-muted-foreground">今天还没有开始学习哦</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>近期学习记录</CardTitle>
          <CardDescription>最近7天的学习情况</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRecords.length > 0 ? (
            <div className="space-y-2">
              {recentRecords.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{record.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      答题 <span className="font-semibold text-foreground">{record.questionsAnswered}</span>
                    </span>
                    <span className="text-muted-foreground">
                      正确 <span className="font-semibold text-success">{record.correctAnswers}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">暂无学习记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
