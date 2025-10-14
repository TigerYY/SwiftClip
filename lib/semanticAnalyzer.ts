// 语义分析器 - 使用纯JavaScript实现以避免Node.js特定依赖
// 注意：在生产环境中，建议使用后端服务进行语义分析

// 中文停用词列表（常见无意义词汇）
const CHINESE_STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去',
  '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '里', '来', '吧', '呢', '啊', '呀', '哦', '嗯', '呃', '这个', '那个',
  '可以', '应该', '可能', '然后', '所以', '因为', '但是', '虽然', '如果', '一些', '一点', '这种', '那种', '什么', '怎么', '为什么',
  '为什么', '怎么样', '多少', '几个', '一下', '一起', '一直', '一定', '一样', '一般', '一边', '一会儿', '一些', '一切', '一种',
  '不要', '不能', '不会', '不是', '不过', '不管', '不仅', '不论', '不如', '不得不', '不可', '不行', '不错', '不过', '不仅', '不论',
  '其实', '其他', '其中', '其次', '其余', '其它', '前后', '前进', '前面', '前后', '前进', '前面', '前后', '前进', '前面'
])

// 关键内容指示词（表示重要信息的词汇）
const KEY_CONTENT_INDICATORS = new Set([
  '首先', '第一', '第二', '第三', '最后', '总结', '重要的是', '关键', '核心', '主要', '重点', '要点', '结论', '结果',
  '发现', '证明', '显示', '表明', '建议', '推荐', '应该', '必须', '需要', '务必', '记住', '注意', '警告', '危险',
  '好处', '优势', '优点', '价值', '意义', '影响', '作用', '功能', '方法', '技巧', '步骤', '流程', '过程', '原理',
  '定义', '概念', '理论', '观点', '看法', '意见', '建议', '方案', '策略', '计划', '目标', '目的', '意图', '动机'
])

// 冗余内容指示词（表示填充或过渡的词汇）
const REDUNDANT_INDICATORS = new Set([
  '那个', '这个', '然后', '嗯', '啊', '呃', '就是', '就是说', '其实呢', '说实话', '老实说', '基本上', '大概', '可能',
  '也许', '似乎', '好像', '看起来', '听起来', '感觉上', '某种程度上', '一般来说', '通常来说', '众所周知', '大家都知道',
  '如你所知', '正如我们所说', '换句话说', '也就是说', '简而言之', '总而言之', '总的来说', '一句话', '说白了', '实际上',
  '事实上', '真的', '确实', '当然', '自然', '显然', '明显', '毫无疑问', '无疑', '肯定', '绝对', '必须承认', '不得不說'
])

export interface SemanticAnalysisResult {
  importantSegments: {
    start: number
    end: number
    text: string
    confidence: number
    reason: string
  }[]
  redundantSegments: {
    start: number
    end: number
    text: string
    reason: string
  }[]
  summary: string
  compressionPlan: {
    keep: number // 保留的秒数
    remove: number // 删除的秒数
    compressionRatio: number // 压缩比例
  }
}

export class SemanticAnalyzer {
  /**
   * 分析文本语义，识别重要和冗余内容
   */
  static analyzeText(
    segments: { start: number; end: number; text: string; confidence: number }[],
    targetDuration: number
  ): SemanticAnalysisResult {
    const importantSegments: SemanticAnalysisResult['importantSegments'] = []
    const redundantSegments: SemanticAnalysisResult['redundantSegments'] = []

    // 计算总时长
    const totalDuration = segments.length > 0 
      ? segments[segments.length - 1].end 
      : 0

    // 分析每个片段
    for (const segment of segments) {
      const text = segment.text.trim()
      
      if (this.isImportantContent(text)) {
        importantSegments.push({
          start: segment.start,
          end: segment.end,
          text: segment.text,
          confidence: segment.confidence,
          reason: this.getImportanceReason(text)
        })
      } else if (this.isRedundantContent(text)) {
        redundantSegments.push({
          start: segment.start,
          end: segment.end,
          text: segment.text,
          reason: this.getRedundancyReason(text)
        })
      }
    }

    // 生成摘要
    const summary = this.generateSummary(segments)

    // 生成压缩计划
    const compressionPlan = this.generateCompressionPlan(
      importantSegments,
      redundantSegments,
      totalDuration,
      targetDuration
    )

    return {
      importantSegments,
      redundantSegments,
      summary,
      compressionPlan
    }
  }

  /**
   * 判断是否为重要内容
   */
  private static isImportantContent(text: string): boolean {
    // 检查关键词
    const words = this.tokenizeChinese(text)
    const hasKeyIndicator = words.some(word => KEY_CONTENT_INDICATORS.has(word))
    
    // 检查句子结构（疑问句、陈述重要事实等）
    const isQuestion = text.includes('?') || text.includes('？')
    const hasImportantStructure = text.includes(':') || text.includes('：') || text.includes('- ')
    
    // 检查置信度（在真实实现中）
    // 这里简化处理，实际可以根据更多特征进行判断
    
    return hasKeyIndicator || isQuestion || hasImportantStructure
  }

  /**
   * 判断是否为冗余内容
   */
  private static isRedundantContent(text: string): boolean {
    const words = this.tokenizeChinese(text)
    
    // 包含冗余指示词
    const hasRedundantIndicator = words.some(word => REDUNDANT_INDICATORS.has(word))
    
    // 短且无意义
    const isShortAndMeaningless = words.length <= 3 && 
      words.every(word => CHINESE_STOP_WORDS.has(word) || word.length === 1)
    
    // 重复性内容（简化处理）
    const isRepetitive = text.length < 10 && words.length <= 2
    
    return hasRedundantIndicator || isShortAndMeaningless || isRepetitive
  }

  /**
   * 中文分词（简化实现）
   */
  private static tokenizeChinese(text: string): string[] {
    // 简化分词实现
    return text
      .replace(/[^\u4e00-\u9fa5]/g, ' ') // 去除非中文字符
      .split(/\s+/)
      .filter(word => word.length > 0 && !CHINESE_STOP_WORDS.has(word))
  }

  /**
   * 生成重要性原因
   */
  private static getImportanceReason(text: string): string {
    const words = this.tokenizeChinese(text)
    
    if (words.some(word => KEY_CONTENT_INDICATORS.has(word))) {
      return '包含关键指示词'
    }
    if (text.includes('?') || text.includes('？')) {
      return '疑问句，可能包含重要问题'
    }
    if (text.includes(':') || text.includes('：')) {
      return '说明性内容，可能包含重要信息'
    }
    
    return '高置信度重要内容'
  }

  /**
   * 生成冗余性原因
   */
  private static getRedundancyReason(text: string): string {
    const words = this.tokenizeChinese(text)
    
    if (words.some(word => REDUNDANT_INDICATORS.has(word))) {
      return '包含冗余填充词'
    }
    if (words.length <= 2) {
      return '过短且无实质内容'
    }
    
    return '重复性或过渡性内容'
  }

  /**
   * 生成摘要
   */
  private static generateSummary(segments: { text: string }[]): string {
    // 提取重要句子生成摘要（简化实现）
    const allText = segments.map(s => s.text).join(' ')
    const sentences = allText.split(/[.!?。！？]/).filter(s => s.trim().length > 0)
    
    // 选择包含关键词的句子
    const summarySentences = sentences
      .filter(sentence => {
        const words = this.tokenizeChinese(sentence)
        return words.some(word => KEY_CONTENT_INDICATORS.has(word))
      })
      .slice(0, 3) // 最多取3句
    
    return summarySentences.length > 0 
      ? summarySentences.join('。') + '。'
      : '自动生成的内容摘要（需要更复杂的NLP处理）'
  }

  /**
   * 生成压缩计划
   */
  private static generateCompressionPlan(
    importantSegments: { start: number; end: number }[],
    redundantSegments: { start: number; end: number }[],
    totalDuration: number,
    targetDuration: number
  ): SemanticAnalysisResult['compressionPlan'] {
    // 计算重要内容总时长
    const importantDuration = importantSegments.reduce(
      (sum, seg) => sum + (seg.end - seg.start), 0
    )
    
    // 计算冗余内容总时长
    const redundantDuration = redundantSegments.reduce(
      (sum, seg) => sum + (seg.end - seg.start), 0
    )
    
    // 计算需要保留的时长（重要内容 + 缓冲）
    const keepDuration = Math.min(importantDuration * 1.2, targetDuration)
    
    // 计算压缩比例
    const compressionRatio = (keepDuration / totalDuration) * 100
    
    return {
      keep: Math.round(keepDuration),
      remove: Math.round(totalDuration - keepDuration),
      compressionRatio: Math.round(compressionRatio * 100) / 100
    }
  }
}