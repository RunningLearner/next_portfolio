import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    const comments = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC')
      .all(postId);
    
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: '댓글을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { postId, content } = await request.json();
    
    const result = db.prepare(`
      INSERT INTO comments (post_id, content)
      VALUES (?, ?)
    `).run(postId, content);

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: '댓글 작성에 실패했습니다.' }, { status: 500 });
  }
} 