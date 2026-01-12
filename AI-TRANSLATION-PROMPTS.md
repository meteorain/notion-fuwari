# AI 图书翻译提示词

## 基础翻译提示词

```
你是一位专业的技术图书翻译专家。请将以下 PDF 书籍翻译成中文，并按照指定的 Markdown 格式输出。

### 输出要求

1. **目录结构**
   - 每个章节独立输出为一个 Markdown 文件
   - 文件命名格式：`01-chapter-name.md`、`02-chapter-name.md`
   - 章节名使用英文小写加连字符

2. **文件格式**
   每个章节文件必须包含 frontmatter 和正文：

   ```markdown
   ---
   title: '第X章：章节标题'
   draft: false
   ---

   ## 正文内容
   ```

3. **翻译规范**
   - 专业术语首次出现时给出英文原文：深度学习（Deep Learning）
   - 代码保持原样，只翻译注释
   - 数学公式保持原样
   - 保持原文的标题层级结构
   - 中英文之间加空格
   - 术语翻译保持一致性

4. **Markdown 格式**
   - 一级标题：`## 1.1 节标题`
   - 二级标题：`### 1.1.1 小节标题`
   - 代码块：用三个反引号包裹，标注语言
   - 列表：使用 `-` 或数字
   - 强调：`**粗体**`、`*斜体*`

### 示例输出

章节文件示例：

```markdown
---
title: '第一章：神经网络基础'
draft: false
---

## 1.1 什么是神经网络

神经网络（Neural Network）是一种模拟人脑神经元连接方式的计算模型...

### 1.1.1 基本结构

神经网络由以下几部分组成：

- **输入层**：接收原始数据
- **隐藏层**：进行特征提取和转换
- **输出层**：产生最终结果

## 1.2 代码实现

以下是一个简单的神经网络实现：

\`\`\`python
import numpy as np

class NeuralNetwork:
    def __init__(self, layers):
        # 初始化网络
        self.layers = layers
\`\`\`
```

### 请开始翻译

书籍信息：
- 书名：[书名]
- 作者：[作者]
- 语言：英文 → 中文

请逐章翻译，每次输出一个章节的完整 Markdown 文件。
```

---

## 分章节翻译提示词

如果一次翻译整本书太长，可以分章节进行：

```
请翻译《[书名]》的第 [X] 章，输出为符合以下格式的 Markdown 文件。

### 输出格式

```markdown
---
title: '第[X]章：[章节标题]'
draft: false
---

[章节内容...]
```

### 翻译要求

1. **术语处理**
   - 保持这些术语的翻译一致：
     * Neural Network → 神经网络
     * Deep Learning → 深度学习
     * [其他术语...]

2. **格式要求**
   - 保持原文的标题层级（##、###）
   - 代码块保持原样，只翻译注释
   - 数学公式不翻译

3. **命名规则**
   - 文件名：`[两位数字]-[英文章节名].md`
   - 例如：`01-introduction.md`、`02-neural-networks.md`

### 第 [X] 章原文

[粘贴章节原文或 PDF 提取的文本]
```

---

## 创建图书元信息提示词

翻译完章节后，需要生成 `index.md`：

```
请根据以下图书信息，生成符合格式的 index.md 元信息文件。

### 图书信息
- 书名：[中文书名]
- 原书名：[英文书名]
- 作者：[作者名]
- 译者：[你的名字]
- 简介：[1-2 句话概括]
- 标签：[技术类别]

### 输出格式

```markdown
---
title: '《[中文书名]》'
author: '[英文作者名]'
translator: '[译者名]'
published: [今天日期 YYYY-MM-DD]
updated: [今天日期 YYYY-MM-DD]
description: '[简介 50-100 字]'
image: ''
tags: ['标签1', '标签2', '标签3']
status: 'ongoing'
draft: false
---

## 译者序

[可选：你对这本书的理解]

## 关于本书

[书籍背景、作者介绍、主要内容等]
```

请生成完整的 index.md 内容。
```

---

## 批量翻译提示词（Claude/GPT）

对于支持长上下文的 AI：

```
我需要你将一本技术图书翻译成中文，并输出为 Markdown 格式的多个文件。

### 任务说明

1. **输入**：PDF 提取的文本或章节列表
2. **输出**：
   - 1 个 `index.md`（图书元信息）
   - N 个章节文件（`01-xxx.md`, `02-xxx.md`, ...）

### 格式规范

#### index.md 模板
```yaml
---
title: '《书名》'
author: '作者'
translator: '译者'
published: YYYY-MM-DD
updated: YYYY-MM-DD
description: '简介'
image: ''
tags: ['标签']
status: 'ongoing'
draft: false
---

前言内容...
```

#### 章节文件模板
```yaml
---
title: '第X章：标题'
draft: false
---

正文...
```

### 翻译规则

1. **术语统一**：建立术语表，确保全书术语翻译一致
2. **代码保留**：代码块保持原样，只翻译注释
3. **公式保留**：LaTeX 公式不翻译
4. **结构保持**：标题层级、列表格式保持原样
5. **空格规范**：中英文之间加空格

### 输出方式

每个文件用以下格式分隔：

```
=== FILE: index.md ===
[文件内容]

=== FILE: 01-introduction.md ===
[文件内容]

=== FILE: 02-basics.md ===
[文件内容]
```

### 书籍信息

- 书名：[填写]
- 作者：[填写]
- 章节数：[填写]

[粘贴书籍内容或 PDF 文本]

请开始翻译，逐个输出文件内容。
```

---

## PDF 文本提取建议

### 推荐工具

1. **PyPDF2**（Python）
   ```python
   import PyPDF2

   with open('book.pdf', 'rb') as file:
       reader = PyPDF2.PdfReader(file)
       for page in reader.pages:
           text = page.extract_text()
           print(text)
   ```

2. **pdfplumber**（更准确）
   ```python
   import pdfplumber

   with pdfplumber.open('book.pdf') as pdf:
       for page in pdf.pages:
           text = page.extract_text()
           print(text)
   ```

3. **在线工具**
   - Adobe Acrobat（导出为文本）
   - smallpdf.com
   - PDF24

### 提取后处理

提取出的文本可能需要清理：
- 删除页眉页脚
- 删除页码
- 合并断行
- 分离章节

---

## 翻译工作流程

### 步骤 1：准备工作
1. 提取 PDF 文本
2. 分析章节结构
3. 建立术语表

### 步骤 2：翻译第一章
```
使用上面的"分章节翻译提示词"，翻译第一章
```

### 步骤 3：审核调整
- 检查格式是否正确
- 确认术语翻译
- 测试在博客中显示效果

### 步骤 4：批量翻译
- 复用提示词翻译后续章节
- 保持术语一致性
- 定期更新 `updated` 字段

### 步骤 5：生成元信息
```
使用"创建图书元信息提示词"生成 index.md
```

### 步骤 6：部署测试
```bash
# 本地测试
pnpm dev

# 访问 http://localhost:4321/books/

# 构建生产版本
pnpm build
```

---

## 术语表示例

建议在翻译前准备术语表，确保一致性：

| 英文 | 中文 | 首次出现格式 |
|------|------|-------------|
| Neural Network | 神经网络 | 神经网络（Neural Network） |
| Deep Learning | 深度学习 | 深度学习（Deep Learning） |
| Gradient Descent | 梯度下降 | 梯度下降（Gradient Descent） |
| Activation Function | 激活函数 | 激活函数（Activation Function） |
| Backpropagation | 反向传播 | 反向传播（Backpropagation） |

---

## 常见问题

### Q1: 章节太长怎么办？
**A**: 可以拆分成多个小节：
- `01-1-introduction.md`
- `01-2-background.md`
- `01-3-motivation.md`

### Q2: 如何处理图片？
**A**:
1. 提取图片到 `src/content/assets/images/book-name/`
2. 在 Markdown 中引用：`![图片描述](../assets/images/book-name/figure-1.png)`

### Q3: 数学公式如何显示？
**A**: 支持 LaTeX：
- 行内：`$E = mc^2$`
- 块级：`$$ ... $$`

### Q4: 翻译进度如何显示？
**A**: 更新 `index.md` 的 `status` 字段：
- `ongoing` - 连载中
- `completed` - 已完结
- `paused` - 暂停中

---

## 提示词优化建议

根据不同 AI 模型调整：

### Claude（推荐）
- 擅长长文本处理
- 可以一次处理多个章节
- 格式输出准确

### GPT-4
- 需要更详细的格式说明
- 建议分章节处理
- 注意 token 限制

### 本地模型（LLaMA、Mistral）
- 需要更明确的示例
- 建议小段落处理
- 多次迭代优化

---

## 文件保存脚本

翻译完成后，可以用脚本批量创建文件：

```python
import os

# 配置
book_slug = "deep-learning-book"
base_path = f"src/content/books/{book_slug}"

# 创建目录
os.makedirs(base_path, exist_ok=True)

# 文件内容字典
files = {
    "index.md": """---
title: '《深度学习》'
author: 'Ian Goodfellow'
translator: '译者名'
published: 2025-01-12
updated: 2025-01-12
description: '深度学习经典教材'
image: ''
tags: ['深度学习', 'AI']
status: 'ongoing'
draft: false
---

## 关于本书
""",
    "01-introduction.md": """---
title: '第一章：引言'
draft: false
---

## 内容
""",
}

# 写入文件
for filename, content in files.items():
    with open(os.path.join(base_path, filename), 'w', encoding='utf-8') as f:
        f.write(content)

print(f"✅ 已创建 {len(files)} 个文件")
```

---

祝翻译顺利！如有问题请参考 `BOOK-TRANSLATION-GUIDE.md`。
