import { NextRequest, NextResponse } from 'next/server'
import { generateRFMExports } from '@/lib/rfm-export'
import type { Customer } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { customers, segment, momentum } = await request.json()

    if (!customers || !Array.isArray(customers)) {
      return NextResponse.json({ error: 'Invalid customers data' }, { status: 400 })
    }

    // Filter customers by RFM segment or Momentum segment
    let filteredCustomers: Customer[] = customers

    if (segment) {
      filteredCustomers = customers.filter((c: Customer) => c.rfm_segment === segment)
    } else if (momentum) {
      filteredCustomers = customers.filter((c: Customer) => c.momentum_segment === momentum)
    }

    const exports = generateRFMExports(filteredCustomers, new Date())

    // Return CSV for specific segment/momentum
    if (segment || momentum) {
      const key = segment || momentum
      const segmentKey = `rfm_${key.toLowerCase().replace(/\s+/g, '_')}`
      const csvData = exports[segmentKey]?.csv || ''
      
      return new Response(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${segmentKey}.csv"`
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Export completed'
    })
  } catch (error) {
    console.error('RFM export error:', error)
    return NextResponse.json({ error: 'Failed to generate exports' }, { status: 500 })
  }
}
