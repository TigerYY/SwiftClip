import { NextRequest, NextResponse } from 'next/server'
import { PerformanceMonitor } from '@/lib/server/performanceMonitor'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '100')
    const operation = searchParams.get('operation')

    switch (type) {
      case 'performance':
        const metrics = PerformanceMonitor.getMetrics(limit)
        return NextResponse.json({
          success: true,
          data: metrics,
          count: metrics.length
        })

      case 'system':
        const systemMetrics = PerformanceMonitor.getSystemMetrics(limit)
        return NextResponse.json({
          success: true,
          data: systemMetrics,
          count: systemMetrics.length
        })

      case 'stats':
        const stats = PerformanceMonitor.getOperationStats(operation || undefined)
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'memory':
        const minutes = parseInt(searchParams.get('minutes') || '60')
        const memoryTrend = PerformanceMonitor.getMemoryTrend(minutes)
        return NextResponse.json({
          success: true,
          data: memoryTrend
        })

      case 'all':
      default:
        const allMetrics = PerformanceMonitor.getMetrics(limit)
        const allSystemMetrics = PerformanceMonitor.getSystemMetrics(limit)
        const allStats = PerformanceMonitor.getOperationStats()
        
        return NextResponse.json({
          success: true,
          data: {
            performance: allMetrics,
            system: allSystemMetrics,
            stats: allStats
          },
          counts: {
            performance: allMetrics.length,
            system: allSystemMetrics.length
          }
        })
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    PerformanceMonitor.clearMetrics()
    return NextResponse.json({
      success: true,
      message: 'All metrics cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}