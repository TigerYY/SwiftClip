export interface PerformanceMetrics {
  timestamp: string
  requestId: string
  operation: string
  duration: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  cpuUsage?: {
    user: number
    system: number
  }
  metadata?: Record<string, any>
}

export interface SystemMetrics {
  timestamp: string
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  uptime: number
  loadAverage?: number[]
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = []
  private static systemMetrics: SystemMetrics[] = []
  private static maxMetricsCount = 1000
  private static metricsCollectionInterval: NodeJS.Timeout | null = null

  /**
   * 开始性能监控
   */
  static startMonitoring(intervalMs: number = 60000): void {
    if (this.metricsCollectionInterval) {
      return // 已经在监控中
    }

    this.metricsCollectionInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, intervalMs)

    console.log(`Performance monitoring started with ${intervalMs}ms interval`)
  }

  /**
   * 停止性能监控
   */
  static stopMonitoring(): void {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval)
      this.metricsCollectionInterval = null
      console.log('Performance monitoring stopped')
    }
  }

  /**
   * 记录操作性能指标
   */
  static recordMetrics(
    requestId: string,
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      requestId,
      operation,
      duration,
      memoryUsage: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      },
      cpuUsage: {
        user: Math.round(cpuUsage.user / 1000 * 100) / 100, // ms
        system: Math.round(cpuUsage.system / 1000 * 100) / 100, // ms
      },
      metadata,
    }

    this.metrics.push(metrics)

    // 保持指标数量在限制内
    if (this.metrics.length > this.maxMetricsCount) {
      this.metrics = this.metrics.slice(-this.maxMetricsCount)
    }
  }

  /**
   * 收集系统指标
   */
  private static collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage()

    const systemMetrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      },
      uptime: Math.round(process.uptime()),
    }

    // 尝试获取系统负载（在某些环境中可能不可用）
    try {
      const os = require('os')
      systemMetrics.loadAverage = os.loadavg()
    } catch (error) {
      // 忽略错误，某些环境可能不支持
    }

    this.systemMetrics.push(systemMetrics)

    // 保持系统指标数量在限制内
    if (this.systemMetrics.length > this.maxMetricsCount) {
      this.systemMetrics = this.systemMetrics.slice(-this.maxMetricsCount)
    }
  }

  /**
   * 获取性能指标
   */
  static getMetrics(limit?: number): PerformanceMetrics[] {
    if (limit) {
      return this.metrics.slice(-limit)
    }
    return [...this.metrics]
  }

  /**
   * 获取系统指标
   */
  static getSystemMetrics(limit?: number): SystemMetrics[] {
    if (limit) {
      return this.systemMetrics.slice(-limit)
    }
    return [...this.systemMetrics]
  }

  /**
   * 获取操作统计信息
   */
  static getOperationStats(operation?: string): {
    count: number
    averageDuration: number
    minDuration: number
    maxDuration: number
    totalDuration: number
  } {
    const filteredMetrics = operation
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalDuration: 0,
      }
    }

    const durations = filteredMetrics.map(m => m.duration)
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0)

    return {
      count: filteredMetrics.length,
      averageDuration: Math.round(totalDuration / filteredMetrics.length * 100) / 100,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDuration: Math.round(totalDuration * 100) / 100,
    }
  }

  /**
   * 清除所有指标
   */
  static clearMetrics(): void {
    this.metrics = []
    this.systemMetrics = []
  }

  /**
   * 获取内存使用趋势
   */
  static getMemoryTrend(minutes: number = 60): {
    timestamps: string[]
    heapUsed: number[]
    heapTotal: number[]
    rss: number[]
  } {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000)
    const recentMetrics = this.systemMetrics.filter(
      m => new Date(m.timestamp) >= cutoffTime
    )

    return {
      timestamps: recentMetrics.map(m => m.timestamp),
      heapUsed: recentMetrics.map(m => m.memory.heapUsed),
      heapTotal: recentMetrics.map(m => m.memory.heapTotal),
      rss: recentMetrics.map(m => m.memory.rss),
    }
  }

  /**
   * 性能监控装饰器
   */
  static monitor(operation: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const requestId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const startTime = Date.now()

        try {
          const result = await method.apply(this, args)
          const duration = Date.now() - startTime

          PerformanceMonitor.recordMetrics(requestId, operation, duration, {
            method: propertyName,
            argsCount: args.length,
            success: true,
          })

          return result
        } catch (error) {
          const duration = Date.now() - startTime

          PerformanceMonitor.recordMetrics(requestId, operation, duration, {
            method: propertyName,
            argsCount: args.length,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          })

          throw error
        }
      }

      return descriptor
    }
  }
}

// 自动启动性能监控（在生产环境中）
if (process.env.NODE_ENV === 'production') {
  PerformanceMonitor.startMonitoring(30000) // 30秒间隔
} else if (process.env.NODE_ENV === 'development') {
  PerformanceMonitor.startMonitoring(60000) // 60秒间隔
}

export const performanceMonitor = PerformanceMonitor