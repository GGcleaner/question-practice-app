import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Question } from '@/types';
import { XCircle } from 'lucide-react';

const WrongQuestions = () => {
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const answers = storage.getUserAnswers();
    const wrongIds = new Set(answers.filter(a => !a.isCorrect).map(a => a.questionId));
    
    const banks = storage.getQuestionBanks();
    const allQuestions = banks.flatMap(b => b.questions);
    const wrong = allQuestions.filter(q => wrongIds.has(q.id));
    
    setWrongQuestions(wrong);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">错题本</h1>
        <p className="text-muted-foreground">复习错题，查漏补缺</p>
      </div>

      {wrongQuestions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">暂无错题</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {wrongQuestions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                  <span>{index + 1}. {q.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((opt, i) => {
                  const isCorrect = Array.isArray(q.correctAnswer) 
                    ? q.correctAnswer.includes(i) 
                    : i === q.correctAnswer;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded ${isCorrect ? 'bg-success/10 border-2 border-success' : 'bg-muted'}`}
                    >
                      {opt}
                    </div>
                  );
                })}
                {q.explanation && (
                  <div className="p-3 bg-primary/5 rounded border-l-4 border-primary">
                    <p className="text-sm"><strong>解析：</strong>{q.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WrongQuestions;
