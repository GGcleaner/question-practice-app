import * as XLSX from 'xlsx';
import { Question } from '@/types';

export const parseExcelFile = async (file: File): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // 跳过标题行，从第二行开始解析
        const questions: Question[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row[0]) continue; // 跳过空行
          
          const typeStr = String(row[9] || 'single').toLowerCase();
          const questionType = typeStr === 'multiple' ? 'multiple' : typeStr === 'judgment' ? 'judgment' : 'single';
          
          let options: string[] = [];
          let correctAnswer: number | number[];
          
          if (questionType === 'judgment') {
            options = ['正确', '错误'];
            correctAnswer = Number(row[5]) - 1 || 0;
          } else {
            options = [
              String(row[1] || ''),
              String(row[2] || ''),
              String(row[3] || ''),
              String(row[4] || ''),
            ].filter(opt => opt);
            
            if (questionType === 'multiple') {
              // 多选题：答案格式如 "1,3,4" 或 "1 3 4"
              const answerStr = String(row[5] || '');
              correctAnswer = answerStr.split(/[,，\s]+/).map(a => Number(a.trim()) - 1).filter(a => !isNaN(a));
            } else {
              correctAnswer = Number(row[5]) - 1 || 0;
            }
          }
          
          const question: Question = {
            id: crypto.randomUUID(),
            question: String(row[0] || ''),
            type: questionType,
            options,
            correctAnswer,
            category: String(row[6] || ''),
            difficulty: String(row[7] || ''),
            explanation: String(row[8] || ''),
          };
          
          questions.push(question);
        }
        
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsBinaryString(file);
  });
};

export const downloadTemplate = () => {
  const template = [
    ['题目', '选项A', '选项B', '选项C', '选项D', '正确答案', '分类', '难度', '解析', '类型'],
    ['什么是React？', 'JavaScript库', '编程语言', '数据库', '操作系统', '1', '前端', '简单', 'React是一个用于构建用户界面的JavaScript库', 'single'],
    ['以下哪些是前端框架？', 'React', 'Vue', 'Django', 'Angular', '1,2,4', '前端', '简单', 'React、Vue和Angular都是前端框架', 'multiple'],
    ['HTML是编程语言', '', '', '', '', '2', '前端', '简单', 'HTML是标记语言，不是编程语言', 'judgment'],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '题库模板');
  XLSX.writeFile(wb, '题库模板.xlsx');
};
