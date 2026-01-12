/* 使用 Python markitdown 将各种文件格式转换为 Markdown */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// 获取命令行参数
const args = process.argv.slice(2);

// 显示使用说明
function showUsage() {
  console.log(`
使用方法:
  pnpm convert <文件路径> [输出路径]

参数:
  <文件路径>    必需 - 要转换的文件路径
  [输出路径]    可选 - 输出的 Markdown 文件路径（默认：原文件名.md）

支持的文件格式:
  - PDF (.pdf)
  - Word (.docx, .doc)
  - PowerPoint (.pptx, .ppt)
  - Excel (.xlsx, .xls)
  - 图片 (.jpg, .jpeg, .png)
  - 音频 (.mp3, .wav)
  - HTML (.html)
  - 文本 (.txt)
  - CSV (.csv)
  - JSON (.json)
  - XML (.xml)

前置要求:
  需要先安装 Python 和 markitdown:
    pip install markitdown

示例:
  pnpm convert document.pdf
  pnpm convert document.pdf output.md
  pnpm convert presentation.pptx
  `);
}

// 检查参数
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showUsage();
  process.exit(0);
}

const inputFile = args[0];
const outputFile = args[1];

// 检查输入文件是否存在
if (!fs.existsSync(inputFile)) {
  console.error(`❌ 错误: 文件不存在: ${inputFile}`);
  process.exit(1);
}

// 获取文件信息
const inputPath = path.resolve(inputFile);
const inputExt = path.extname(inputFile).toLowerCase();
const inputBasename = path.basename(inputFile, inputExt);
const inputDir = path.dirname(inputPath);

// 确定输出文件路径
let outputPath;
if (outputFile) {
  outputPath = path.resolve(outputFile);
} else {
  outputPath = path.join(inputDir, `${inputBasename}.md`);
}

// 检查 Python 和 markitdown 是否安装
async function checkDependencies() {
  return new Promise((resolve) => {
    const pythonCheck = spawn('python', ['--version']);

    pythonCheck.on('error', () => {
      console.error('❌ 错误: 未找到 Python');
      console.error('请先安装 Python: https://www.python.org/downloads/');
      process.exit(1);
    });

    pythonCheck.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ 错误: Python 未正确安装');
        process.exit(1);
      }

      // 检查 markitdown
      const markitdownCheck = spawn('python', ['-m', 'pip', 'show', 'markitdown']);
      let output = '';

      markitdownCheck.stdout.on('data', (data) => {
        output += data.toString();
      });

      markitdownCheck.on('close', (code) => {
        if (code !== 0 || !output.includes('Name: markitdown')) {
          console.error('❌ 错误: markitdown 未安装');
          console.error('请运行: pip install markitdown');
          process.exit(1);
        }
        resolve();
      });
    });
  });
}

// 主转换函数
async function convertToMarkdown() {
  console.log(`\n📄 正在转换文件: ${inputFile}`);
  console.log(`📝 输出路径: ${outputPath}\n`);

  try {
    // 检查依赖
    await checkDependencies();

    console.log('⏳ 正在处理...\n');

    // 调用 markitdown 命令行工具
    const markitdown = spawn('markitdown', [inputPath]);

    let markdownContent = '';
    let errorOutput = '';

    // 收集输出
    markitdown.stdout.on('data', (data) => {
      markdownContent += data.toString();
    });

    markitdown.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    markitdown.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ 转换失败:');
        console.error(errorOutput);
        process.exit(1);
      }

      // 写入输出文件
      fs.writeFileSync(outputPath, markdownContent, 'utf-8');

      // 获取文件大小
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);

      console.log('✅ 转换成功！\n');
      console.log(`📊 统计信息:`);
      console.log(`   - 输入文件: ${inputFile}`);
      console.log(`   - 文件大小: ${(inputStats.size / 1024).toFixed(2)} KB`);
      console.log(`   - 输出文件: ${outputPath}`);
      console.log(`   - 输出大小: ${(outputStats.size / 1024).toFixed(2)} KB`);
      console.log(`   - Markdown 长度: ${markdownContent.length} 字符`);
      console.log(`   - 行数: ${markdownContent.split('\n').length} 行\n`);

      // 显示前几行预览
      const previewLines = markdownContent.split('\n').slice(0, 10);
      console.log('📖 内容预览 (前 10 行):');
      console.log('─'.repeat(60));
      console.log(previewLines.join('\n'));
      if (markdownContent.split('\n').length > 10) {
        console.log('...');
      }
      console.log('─'.repeat(60));
    });

  } catch (error) {
    console.error('\n❌ 转换失败:');
    console.error(`   错误信息: ${error.message}`);

    if (error.stack) {
      console.error('\n详细错误:');
      console.error(error.stack);
    }

    // 提供帮助信息
    console.error('\n💡 提示:');
    console.error('   - 确保已安装 Python 和 markitdown');
    console.error('   - 运行: pip install markitdown');
    console.error('   - 确保文件格式受支持');
    console.error('   - 检查文件是否损坏');

    process.exit(1);
  }
}

// 执行转换
convertToMarkdown();
