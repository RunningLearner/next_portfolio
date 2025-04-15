import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: '게시물을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, image_path, video_path } = await request.json();
    
    const result = db.prepare(`
      INSERT INTO posts (title, content, image_path, video_path)
      VALUES (?, ?, ?, ?)
    `).run(title, content, image_path, video_path);

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: '게시물 작성에 실패했습니다.' }, { status: 500 });
  }
} 