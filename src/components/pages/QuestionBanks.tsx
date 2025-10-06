import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { parseExcelFile, downloadTemplate } from '@/lib/excelParser';
import { QuestionBank } from '@/types';
import { Upload, Download, Trash2, BookOpen, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const QuestionBanks = () => {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [bankName, setBankName] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = () => {
    setBanks(storage.getQuestionBanks());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!bankName.trim()) {
      toast({
        title: '提示',
        description: '请先输入题库名称',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const questions = await parseExcelFile(file);
      
      if (questions.length === 0) {
        toast({
          title: '错误',
          description: '未能解析到任何题目，请检查文件格式',
          variant: 'destructive',
        });
        return;
      }

      const newBank: QuestionBank = {
        id: crypto.randomUUID(),
        name: bankName,
        questions,
        createdAt: Date.now(),
      };

      storage.saveQuestionBank(newBank);
      loadBanks();
      setBankName('');
      
      toast({
        title: '成功',
        description: `成功导入 ${questions.length} 道题目`,
      });
    } catch (error) {
      toast({
        title: '错误',
        description: '文件解析失败，请检查文件格式',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteBank = (bankId: string) => {
    storage.deleteQuestionBank(bankId);
    loadBanks();
    toast({
      title: '已删除',
      description: '题库已删除',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">题库管理</h1>
        <p className="text-muted-foreground">上传Excel文件创建题库，开始你的学习之旅</p>
      </div>

      {/* Upload Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            创建新题库
          </CardTitle>
          <CardDescription>支持Excel格式（.xlsx, .xls）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bankName">题库名称</Label>
              <Input
                id="bankName"
                placeholder="例如：前端开发题库"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">选择文件</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              下载模板
            </Button>
            <p className="text-sm text-muted-foreground flex items-center">
              不知道如何准备文件？下载模板参考格式
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Banks List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">我的题库 ({banks.length})</h2>
        {banks.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">还没有题库</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                上传Excel文件创建你的第一个题库吧！
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <Card key={bank.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{bank.name}</CardTitle>
                      <CardDescription>
                        {bank.questions.length} 道题目
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除题库"{bank.name}"及其所有题目。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBank(bank.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>创建时间</span>
                      <span>{new Date(bank.createdAt).toLocaleDateString()}</span>
                    </div>
                    {bank.questions[0]?.category && (
                      <div className="flex justify-between">
                        <span>分类</span>
                        <span>{bank.questions[0].category}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBanks;
