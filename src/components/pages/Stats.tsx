import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { BarChart3 } from 'lucide-react';

const Stats = () => {
  const [stats, setStats] = useState({ total: 0, correct: 0, wrong: 0, accuracy: 0 });

  useEffect(() => {
    const answers = storage.getUserAnswers();
    const correct = answers.filter(a => a.isCorrect).length;
    const wrong = answers.filter(a => !a.isCorrect).length;
    const accuracy = answers.length > 0 ? (correct / answers.length) * 100 : 0;
    
    setStats({ total: answers.length, correct, wrong, accuracy });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">学习统计</h1>
        <p className="text-muted-foreground">数据分析，了解学习情况</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总答题数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">正确数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.correct}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">错误数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.wrong}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">正确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.accuracy.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
