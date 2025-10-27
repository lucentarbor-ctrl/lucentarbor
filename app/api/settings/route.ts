/**
 * 설정 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const where = category ? { category } : {};
    const settings = await prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
    return NextResponse.json({ status: 'success', data: settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch settings', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const setting = await prisma.setting.create({
      data: {
        key: data.key,
        value: data.value,
        category: data.category,
        description: data.description,
        isSecret: data.is_secret || false,
      },
    });
    return NextResponse.json({ status: 'success', data: setting });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create setting', message: error.message }, { status: 500 });
  }
}
