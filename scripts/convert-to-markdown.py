#!/usr/bin/env python3
"""
使用 markitdown 将各种文件格式转换为 Markdown

支持的格式：PDF, Word, PowerPoint, Excel, 图片, 音频, HTML, 文本等
"""

import sys
import os
from pathlib import Path

def show_usage():
    """显示使用说明"""
    print("""
使用方法:
  python scripts/convert-to-markdown.py <文件路径> [输出路径]
  或
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
  pip install markitdown

示例:
  python scripts/convert-to-markdown.py document.pdf
  python scripts/convert-to-markdown.py document.pdf output.md
  pnpm convert presentation.pptx
    """)

def main():
    """主函数"""
    # 检查参数
    if len(sys.argv) < 2 or sys.argv[1] in ['--help', '-h']:
        show_usage()
        sys.exit(0)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    # 检查输入文件是否存在
    if not os.path.exists(input_file):
        print(f"❌ 错误: 文件不存在: {input_file}")
        sys.exit(1)

    # 检查 markitdown 是否安装
    try:
        from markitdown import MarkItDown
    except ImportError:
        print("❌ 错误: markitdown 未安装")
        print("请运行: pip install markitdown")
        sys.exit(1)

    # 获取文件信息
    input_path = Path(input_file).resolve()
    input_ext = input_path.suffix.lower()
    input_basename = input_path.stem
    input_dir = input_path.parent

    # 确定输出文件路径
    if output_file:
        output_path = Path(output_file).resolve()
    else:
        output_path = input_dir / f"{input_basename}.md"

    print(f"\n📄 正在转换文件: {input_file}")
    print(f"📝 输出路径: {output_path}\n")

    try:
        # 创建 MarkItDown 实例
        print("⏳ 正在处理...")
        md = MarkItDown()

        # 转换文件
        result = md.convert(str(input_path))
        markdown_content = result.text_content

        # 写入输出文件
        output_path.write_text(markdown_content, encoding='utf-8')

        # 获取文件大小
        input_size = input_path.stat().st_size
        output_size = output_path.stat().st_size

        print("✅ 转换成功！\n")
        print("📊 统计信息:")
        print(f"   - 输入文件: {input_file}")
        print(f"   - 文件大小: {input_size / 1024:.2f} KB")
        print(f"   - 输出文件: {output_path}")
        print(f"   - 输出大小: {output_size / 1024:.2f} KB")
        print(f"   - Markdown 长度: {len(markdown_content)} 字符")
        print(f"   - 行数: {len(markdown_content.splitlines())} 行\n")

        # 显示前几行预览
        preview_lines = markdown_content.splitlines()[:10]
        print("📖 内容预览 (前 10 行):")
        print("─" * 60)
        print("\n".join(preview_lines))
        if len(markdown_content.splitlines()) > 10:
            print("...")
        print("─" * 60)

    except Exception as e:
        print(f"\n❌ 转换失败:")
        print(f"   错误信息: {str(e)}")
        print("\n💡 提示:")
        print("   - 确保文件格式受支持")
        print("   - 检查文件是否损坏")
        print("   - 某些格式可能需要额外的依赖（如 PDF 需要 pdfminer.six）")
        sys.exit(1)

if __name__ == "__main__":
    main()
