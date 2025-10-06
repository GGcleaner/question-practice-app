import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/lib/storage';
import { Question, QuestionBank, UserAnswer } from '@/types';
import { CheckCircle2, XCircle, Star, ArrowRight, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const Practice = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'wrong'>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<UserAnswer[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadedBanks = storage.getQuestionBanks();
    setBanks(loadedBanks);
    if (loadedBanks.length > 0 && !selectedBankId) {
      setSelectedBankId(loadedBanks[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      loadQuestions();
    }
  }, [selectedBankId, filterMode]);

  const loadQuestions = () => {
    const bank = banks.find(b => b.id === selectedBankId);
    if (!bank) return;

    let filteredQuestions = [...bank.questions];
    const userAnswers = storage.getUserAnswers();
    const answeredIds = new Set(userAnswers.map(a => a.questionId));
    const wrongIds = new Set(
      userAnswers.filter(a => !a.isCorrect).map(a => a.questionId)
    );

    if (filterMode === 'unanswered') {
      filteredQuestions = filteredQuestions.filter(q => !answeredIds.has(q.id));
    } else if (filterMode === 'wrong') {
      filteredQuestions = filteredQuestions.filter(q => wrongIds.has(q.id));
    }

    setQuestions(filteredQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setSessionAnswers([]);
  };

  const currentQuestion = questions[currentIndex];

  const handleMultipleChoice = (optionIndex: number) => {
    if (showResult) return;
    const current = (selectedAnswer as number[]) || [];
    const newSelection = current.includes(optionIndex)
      ? current.filter(i => i !== optionIndex)
      : [...current, optionIndex];
    setSelectedAnswer(newSelection);
  };

  const checkAnswer = (selected: number | number[], correct: number | number[]): boolean => {
    if (Array.isArray(correct)) {
      if (!Array.isArray(selected)) return false;
      return correct.length === selected.length && correct.every(c => selected.includes(c));
    }
    return selected === correct;
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
      toast({
        title: '提示',
        description: '请选择答案',
        variant: 'destructive',
      });
      return;
    }

    const isCorrect = checkAnswer(selectedAnswer, currentQuestion.correctAnswer);
    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timestamp: Date.now(),
    };

    storage.saveUserAnswer(answer);
    setSessionAnswers([...sessionAnswers, answer]);
    setShowResult(true);

    storage.updateDailyRecord(1, isCorrect ? 1 : 0, 0);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(currentQuestion.type === 'multiple' ? [] : null);
      setShowResult(false);
    } else {
      const lastCorrect = checkAnswer(selectedAnswer!, currentQuestion.correctAnswer);
      const correctCount = sessionAnswers.filter(a => a.isCorrect).length + (lastCorrect ? 1 : 0);
      const total = sessionAnswers.length + 1;
      
      toast({
        title: '练习完成！',
        description: `答对 ${correctCount}/${total} 题，正确率 ${((correctCount / total) * 100).toFixed(1)}%`,
      });
      
      loadQuestions();
    }
  };

  const toggleFavorite = () => {
    const isFav = storage.toggleFavorite(currentQuestion.id);
    toast({
      title: isFav ? '已收藏' : '已取消收藏',
      description: currentQuestion.question,
    });
  };

  if (banks.length === 0) {
    return (
      <Card className="shadow-medium">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-semibold mb-2">还没有题库</h3>
          <p className="text-sm text-muted-foreground">请先创建题库再开始刷题</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>选择题库</Label>
            <Select value={selectedBankId} onValueChange={setSelectedBankId}>
              <SelectTrigger>
                <SelectValue />
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
          
          <div className="space-y-2">
            <Label>筛选模式</Label>
            <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部题目</SelectItem>
                <SelectItem value="unanswered">未做题目</SelectItem>
                <SelectItem value="wrong">错题</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="shadow-medium">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">没有符合条件的题目</h3>
            <p className="text-sm text-muted-foreground mb-4">试试切换其他筛选模式</p>
            <Button onClick={() => setFilterMode('all')}>
              查看全部题目
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return '单选题';
      case 'multiple': return '多选题';
      case 'judgment': return '判断题';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">快速刷题</h1>
        <p className="text-muted-foreground">连续答题，立即查看结果</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>选择题库</Label>
          <Select value={selectedBankId} onValueChange={setSelectedBankId}>
            <SelectTrigger>
              <SelectValue />
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
        
        <div className="space-y-2">
          <Label>筛选模式</Label>
          <Select value={filterMode} onValueChange={(value: any) => setFilterMode(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部题目</SelectItem>
              <SelectItem value="unanswered">未做题目</SelectItem>
              <SelectItem value="wrong">错题</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>进度</Label>
          <div className="flex items-center gap-2 h-10">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
            <Progress 
              value={((currentIndex + 1) / questions.length) * 100} 
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <Card className="shadow-strong">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-primary text-primary-foreground">
                  {getQuestionTypeLabel(currentQuestion.type)}
                </span>
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={storage.isFavorite(currentQuestion.id) ? 'text-warning' : ''}
            >
              <Star className={`h-5 w-5 ${storage.isFavorite(currentQuestion.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
          {currentQuestion.category && (
            <div className="flex gap-2 text-sm text-muted-foreground">
              {currentQuestion.category && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary">
                  {currentQuestion.category}
                </span>
              )}
              {currentQuestion.difficulty && (
                <span className="px-2 py-1 rounded-md bg-muted">
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion.type === 'multiple' ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = (selectedAnswer as number[] || []).includes(index);
                const isCorrect = (currentQuestion.correctAnswer as number[]).includes(index);
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                      showCorrect
                        ? 'border-success bg-success/10'
                        : showWrong
                        ? 'border-destructive bg-destructive/10'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      id={`option-${index}`}
                      checked={isSelected}
                      onCheckedChange={() => handleMultipleChoice(index)}
                      disabled={showResult}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                    {showCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                    {showWrong && <XCircle className="h-5 w-5 text-destructive" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => setSelectedAnswer(parseInt(value))}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                      showCorrect
                        ? 'border-success bg-success/10'
                        : showWrong
                        ? 'border-destructive bg-destructive/10'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      disabled={showResult}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option}
                    </Label>
                    {showCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                    {showWrong && <XCircle className="h-5 w-5 text-destructive" />}
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {showResult && currentQuestion.explanation && (
            <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
              <h4 className="font-semibold mb-2 text-primary">解析</h4>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!showResult ? (
              <Button onClick={handleSubmit} className="flex-1" size="lg">
                提交答案
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1" size="lg">
                {currentIndex < questions.length - 1 ? (
                  <>
                    下一题 <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    完成练习 <RotateCcw className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Practice;
