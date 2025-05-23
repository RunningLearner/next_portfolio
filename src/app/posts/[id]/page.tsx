'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import MarkdownContent from '@/components/MarkdownContent';
import { Post } from '@/types';

interface Comment {
  id: number;
  content: string;
  created_at: string;
}

/// 댓글 + 대댓글(재귀) 타입
interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[]; // 자기 자신을 또 포함할 수 있도록 재귀 구조
}

export default function PostDetail() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?postId=${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      }
    };

    if (params.id) {
      fetchPost();
      fetchComments();
    }
  }, [params.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: params.id,
          content: newComment,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prevComments => [...prevComments, newCommentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  // 답글 폼 열기/닫기
  const toggleReplyForm = (commentId: number) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyContent('');
    } else {
      setReplyingTo(commentId);
      setReplyContent('');
    }
  };

  // 답글 제출
  const handleReplySubmit = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: params.id,
          content: replyContent,
          parentCommentId: parentId, // 대댓글임을 명시
        }),
      });
      if (response.ok) {
        const newReply = await response.json() as CommentWithReplies;
        // 상태에 답글 추가
        setComments(prev =>
          prev.map(c =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies ?? []), newReply] }
              : c
          )
        );
        // 폼 닫기
        setReplyingTo(null);
        setReplyContent('');
      }
    } catch (err) {
      console.error('Error creating reply:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-500 mb-8">
          {new Date(post.created_at).toLocaleDateString()}
        </div>

        {/* 이미지 섹션 */}
        {post.image_path && (
          <div className="mb-8">
            <div className="relative w-full h-96">
              <Image
                src={post.image_path}
                alt="게시물 이미지"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        )}

        {/* 영상 섹션 */}
        {post.video_path && (
          <div className="mb-8">
            <video
              src={post.video_path}
              controls
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* 콘텐츠 섹션 */}
        <div className="prose max-w-none">
          <MarkdownContent content={post.content} />
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">댓글</h2>

          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              placeholder="댓글을 작성하세요"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              댓글 작성
            </button>
          </form>

          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="border p-4 rounded">
                <p>{comment.content}</p>
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>

                {/* 답글 버튼 */}
                <button
                  className="text-blue-500 text-sm mt-2"
                  onClick={() => toggleReplyForm(comment.id)}
                >
                  {replyingTo === comment.id ? '답글 취소' : '답글 쓰기'}
                </button>

                {/* 답글 입력 폼 */}
                {replyingTo === comment.id && (
                  <form
                    onSubmit={(e) => handleReplySubmit(e, comment.id)}
                    className="mt-2"
                  >
                    <textarea
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="답글을 작성하세요"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      답글 등록
                    </button>
                  </form>
                )}

                {/* 기존 답글 렌더링 */}
                {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                  <div className="ml-6 mt-4 space-y-4">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="border-l-2 pl-4">
                        <p>{reply.content}</p>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 