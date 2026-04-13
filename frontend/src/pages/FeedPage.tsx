import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { Card, CardContent } from "../components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { Cpu, Trophy, Popcorn, BookOpen, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { Post } from "../types";

export const getRoomColor = (roomName: string) => {
  switch (roomName) {
    case 'Technology': return { color: 'bg-teal-100 text-teal-800', icon: <Cpu className="w-3 h-3 inline-block mr-1" /> };
    case 'Sports': return { color: 'bg-orange-100 text-orange-800', icon: <Trophy className="w-3 h-3 inline-block mr-1" /> };
    case 'Entertainment': return { color: 'bg-fuchsia-100 text-fuchsia-800', icon: <Popcorn className="w-3 h-3 inline-block mr-1" /> };
    case 'Education': return { color: 'bg-blue-100 text-blue-800', icon: <BookOpen className="w-3 h-3 inline-block mr-1" /> };
    default: return { color: 'bg-slate-100 text-slate-800', icon: <MessageSquare className="w-3 h-3 inline-block mr-1" /> };
  }
};

import { Skeleton } from "../components/ui/skeleton";

export const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const search = searchParams.get("search");
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    setIsLoading(true);
    let url = "/posts";
    const params = new URLSearchParams();
    if (roomId) params.append("roomId", roomId);
    if (search) params.append("search", search);
    params.append("sort", sort);
    if (params.toString()) url += `?${params.toString()}`;

    api.get(url)
      .then(res => {
        setPosts(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [roomId, search, sort]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          {search ? `Search results for "${search}"` : "Main Feed"}
        </h2>
        
        <Tabs value={sort} onValueChange={setSort} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto justify-start md:justify-center">
            <TabsTrigger value="latest" className="flex-1 md:flex-auto">Latest</TabsTrigger>
            <TabsTrigger value="popular" className="flex-1 md:flex-auto">Popular</TabsTrigger>
            <TabsTrigger value="unanswered" className="flex-1 md:flex-auto">Unanswered</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-white border-0 shadow-sm rounded-xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
                <div className="flex justify-between items-center mt-6">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-slate-500 py-16">
          <p className="text-xl">No posts here yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const { color, icon } = getRoomColor(post.roomName);

            return (
              <Link to={`/posts/${post.id}`} key={post.id} className="block group">
                <Card className="bg-white border-0 shadow-sm rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors tracking-tight">{post.title}</h3>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 whitespace-nowrap ${color}`}>
                        {icon}{post.roomName}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span>Posted by {post.username}</span>
                        <span className="text-slate-300">•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-4">
                        <span>{post.repliesCount || 0} Replies</span>
                        <span>{post.viewsCount} views</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
