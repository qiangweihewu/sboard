import React from 'react';

export const StyleDebugger: React.FC = () => {
  React.useEffect(() => {
    // 检查TailwindCSS是否正确加载
    const testDiv = document.createElement('div');
    testDiv.className = 'bg-red-500 p-4 text-white';
    testDiv.style.position = 'fixed';
    testDiv.style.top = '10px';
    testDiv.style.right = '10px';
    testDiv.style.zIndex = '9999';
    testDiv.innerHTML = 'TailwindCSS Test';
    document.body.appendChild(testDiv);

    // 检查CSS变量
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = {
      '--color-primary': rootStyles.getPropertyValue('--color-primary'),
      '--color-blue-500': rootStyles.getPropertyValue('--color-blue-500'),
      '--color-background': rootStyles.getPropertyValue('--color-background'),
    };

    console.log('🎨 CSS Variables:', cssVars);

    // 检查Shadcn UI组件样式
    const buttonTest = document.createElement('button');
    buttonTest.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50';
    buttonTest.style.position = 'fixed';
    buttonTest.style.top = '60px';
    buttonTest.style.right = '10px';
    buttonTest.style.zIndex = '9999';
    buttonTest.innerHTML = 'Shadcn Button Test';
    document.body.appendChild(buttonTest);

    const buttonStyles = getComputedStyle(buttonTest);
    console.log('🔘 Button styles:', {
      display: buttonStyles.display,
      padding: buttonStyles.padding,
      borderRadius: buttonStyles.borderRadius,
      backgroundColor: buttonStyles.backgroundColor,
    });

    // 清理测试元素
    setTimeout(() => {
      document.body.removeChild(testDiv);
      document.body.removeChild(buttonTest);
    }, 5000);
  }, []);

  return null;
};