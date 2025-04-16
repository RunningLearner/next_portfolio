export interface Post {
  id: number;
  title: string;
  content: string;
  image_path: string | null;
  video_path: string | null;
  created_at: string;
} 