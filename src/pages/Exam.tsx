import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Question, QuestionBank, StudySession } from '@/types';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const Exam = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number | number[] }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setBanks(storage.getQuestionBanks());
  }, []);

  useEffect(() => {
    if (isExamStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isExamStarted && !showResults) {
      handleSubmitExam();
    }
  }, [timeLeft, isExamStarted]);

  const startExam = () => {
    const bank = banks.find(b => b.id === selectedBankId);
    if (!bank) return;

    const shuffled = [...bank.questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, bank.questions.length));
    
    setExamQuestions(selected);
    setTimeLeft(timeLimit * 60);
    setAnswers({});
    setIsExamStarted(true);
    setShowResults(false);
  };

  const checkAnswer = (selected: number | number[], correct: number | number[]): boolean => {
    if (Array.isArray(correct)) {
      if (!Array.isArray(selected)) return false;
      return correct.length === selected.length && correct.every(c => selected.includes(c));
    }
    return selected === correct;
  };

  const handleSubmitExam = () => {
    const correctCount = examQuestions.filter(q => {
      const answer = answers[q.id];
      if (!answer) return false;
      return checkAnswer(answer, q.correctAnswer);
    }).length;
    const score = (correctCount / examQuestions.length) * 100;

    const session: StudySession = {
      id: crypto.randomUUID(),
      bankId: selectedBankId,
      answers: examQuestions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] ?? (q.type === 'multiple' ? [] : -1),
        isCorrect: answers[q.id] ? checkAnswer(answers[q.id], q.correctAnswer) : false,
        timestamp: Date.now(),
      })),
      startTime: Date.now() - (timeLimit * 60 - timeLeft) * 1000,
      endTime: Date.now(),
      mode: 'exam',
      score,
    };

    storage.saveStudySession(session);
    setShowResults(true);
    
    toast({
      title: '考试完成！',
      description: `得分：${score.toFixed(1)}分`,
    });
  };

  const handleMultipleChoice = (questionId: string, optionIndex: number) => {
    const current = (answers[questionId] as number[]) || [];
    const newSelection = current.includes(optionIndex)
      ? current.filter(i => i !== optionIndex)
      : [...current, optionIndex];
    setAnswers({ ...answers, [questionId]: newSelection });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return '单选题';
      case 'multiple': return '多选题';
      case 'judgment': return '判断题';
      default: return '';
    }
  };

  if (!isExamStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">模拟考试</h1>
          <p className="text-muted-foreground">限时答题，测试真实水平</p>
        </div>

        <Card className="shadow-medium max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>考试设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>选择题库</Label>
              <Select value={selectedBankId} onValueChange={setSelectedBankId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择题库" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name} ({bank.questions.length}题)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>题目数量</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 20)}
                />
              </div>
              <div className="space-y-2">
                <Label>时长（分钟）</Label>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                />
              </div>
            </div>

            <Button 
              onClick={startExam} 
              disabled={!selectedBankId}
              className="w-full"
              size="lg"
            >
              开始考试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const correctCount = examQuestions.filter(q => {
      const answer = answers[q.id];
      if (!answer) return false;
      return checkAnswer(answer, q.correctAnswer);
    }).length;
    const score = (correctCount / examQuestions.length) * 100;

    return (
      <div className="space-y-6">
        <Card className="shadow-strong max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl">考试完成！</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{score.toFixed(1)}</div>
              <p className="text-muted-foreground">答对 {correctCount}/{examQuestions.length} 题</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setIsExamStarted(false)} className="flex-1">
                返回设置
              </Button>
              <Button onClick={startExam} variant="outline" className="flex-1">
                重新考试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">模拟考试进行中</h1>
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5" />
          <span className={timeLeft < 300 ? 'text-destructive' : ''}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {examQuestions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-primary text-primary-foreground">
                  {getQuestionTypeLabel(question.type)}
                </span>
              </div>
              <CardTitle className="text-base">
                {index + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {question.type === 'multiple' ? (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = ((answers[question.id] as number[]) || []).includes(optIndex);
                    return (
                      <div
                        key={optIndex}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <Checkbox
                          id={`q-${question.id}-opt-${optIndex}`}
                          checked={isSelected}
                          onCheckedChange={() => handleMultipleChoice(question.id, optIndex)}
                        />
                        <Label
                          htmlFor={`q-${question.id}-opt-${optIndex}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => setAnswers({ ...answers, [question.id]: parseInt(value) })}
                >
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                        answers[question.id] === optIndex ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <RadioGroupItem value={optIndex.toString()} id={`q-${question.id}-opt-${optIndex}`} />
                      <Label htmlFor={`q-${question.id}-opt-${optIndex}`} className="flex-1 cursor-pointer font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSubmitExam} size="lg" className="w-full sticky bottom-4">
        提交考试
      </Button>
    </div>
  );
};

export default Exam;
