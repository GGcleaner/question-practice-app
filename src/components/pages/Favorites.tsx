import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { Question } from '@/types';
import { Star } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Question[]>([]);

  useEffect(() => {
    const favIds = storage.getFavorites();
    const banks = storage.getQuestionBanks();
    const allQuestions = banks.flatMap(b => b.questions);
    const favQuestions = allQuestions.filter(q => favIds.includes(q.id));
    setFavorites(favQuestions);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">收藏夹</h1>
        <p className="text-muted-foreground">重点题目集合</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">暂无收藏</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((q, index) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-start gap-2">
                  <Star className="h-5 w-5 text-warning fill-current mt-1 flex-shrink-0" />
                  <span>{index + 1}. {q.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded ${i === q.correctAnswer ? 'bg-success/10 border-2 border-success' : 'bg-muted'}`}
                  >
                    {opt}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
