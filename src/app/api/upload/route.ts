import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // uploads 디렉토리가 없으면 생성
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('디렉토리 생성 실패:', error);
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}.${extension}`;
    const path = join(uploadDir, filename);

    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true, 
      path: `/uploads/${filename}` 
    });
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    return NextResponse.json({ 
      error: '파일 업로드에 실패했습니다.' 
    }, { status: 500 });
  }
} 