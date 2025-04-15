import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(params.id);
    
    if (!post) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: '게시물을 불러오는데 실패했습니다.' }, { status: 500 });
  }
} 