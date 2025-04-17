import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: parseInt(postId),
        parentCommentId: null,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        replies: {                  // 대댓글까지 함께 조회
          orderBy: { created_at: 'asc' },
        },
      },

    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, content, parentCommentId } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    const data: any = {
      content,
      post: { connect: { id: parseInt(postId) } },
    };

    // parentCommentId가 넘어오면 대댓글로 처리
    if (parentCommentId) {
      data.parentComment = { connect: { id: parseInt(parentCommentId) } };
    }

    const comment = await prisma.comment.create({ data });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 