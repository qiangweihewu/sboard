import React from 'react';
import { StyleDebugger } from '@/components/ui/debug-styles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TestPage: React.FC = () => {
  console.log('🧪 TestPage rendering...');
  
  // 检查CSS变量是否可用
  React.useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    console.log('CSS Variables check:');
    console.log('--color-blue-500:', rootStyles.getPropertyValue('--color-blue-500'));
    console.log('--color-purple-500:', rootStyles.getPropertyValue('--color-purple-500'));
    
    // 检查TailwindCSS类是否工作
    const testElement = document.createElement('div');
    testElement.className = 'bg-blue-500 text-white p-4';
    document.body.appendChild(testElement);
    const computedStyle = getComputedStyle(testElement);
    console.log('TailwindCSS test - background color:', computedStyle.backgroundColor);
    console.log('TailwindCSS test - padding:', computedStyle.padding);
    document.body.removeChild(testElement);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 p-8">
      <StyleDebugger />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          完整UI组件测试页面
        </h1>
        
        {/* Shadcn UI组件测试 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Shadcn UI 组件测试</CardTitle>
            <CardDescription>测试各种UI组件是否正常渲染</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            
            <Alert>
              <AlertDescription>
                这是一个Alert组件测试。如果你能看到这个带边框的提示框，说明Shadcn UI组件正常工作。
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="test-input">测试输入框</Label>
              <Input id="test-input" placeholder="输入一些文字测试..." />
            </div>
          </CardContent>
        </Card>
        
        {/* TailwindCSS测试 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold">玻璃态效果</h3>
            </div>
            <p className="text-slate-600">这个卡片应该有玻璃效果和模糊背景。</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold">渐变卡片</h3>
            </div>
            <p className="text-white/90">这个卡片应该有彩色渐变背景。</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold">普通卡片</h3>
            </div>
            <p className="text-slate-600">这是一个普通的白色卡片带阴影。</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">颜色测试</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-20 bg-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">蓝色</div>
            <div className="h-20 bg-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">紫色</div>
            <div className="h-20 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-semibold">翠绿</div>
            <div className="h-20 bg-orange-500 rounded-lg flex items-center justify-center text-white font-semibold">橙色</div>
          </div>
        </div>

        <div className="text-center">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            测试按钮
          </Button>
        </div>
        
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription>
            <strong>调试状态:</strong> 
            <ul className="list-disc list-inside mt-2">
              <li>如果你能看到上面的按钮和卡片，说明Shadcn UI组件正常工作</li>
              <li>如果颜色和渐变正常显示，说明TailwindCSS正常工作</li>
              <li>检查右上角是否出现红色测试框（5秒后消失）</li>
              <li>查看控制台日志了解详细的样式加载信息</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default TestPage;