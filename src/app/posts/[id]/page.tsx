'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
}

export default function PostDetail() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('게시물 불러오기 실패:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?postId=${params.id}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('댓글 불러오기 실패:', error);
      }
    };

    fetchPost();
    fetchComments();
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
        setComments([...comments, newCommentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  if (!post) {
    return <div>로딩 중...</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <article className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="text-gray-500 mb-4">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
          <div className="prose max-w-none">
            {post.content}
          </div>
        </article>

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

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border p-4 rounded">
                <p>{comment.content}</p>
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 