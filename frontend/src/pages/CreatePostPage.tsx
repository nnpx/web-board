import { useState, useEffect } from "react";
import { api } from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export const CreatePostPage = ({ user }: any) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState("1");
  const [rooms, setRooms] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/rooms").then(res => {
      setRooms(res.data);
      if (res.data.length > 0) {
        setRoomId(res.data[0].id.toString());
      }
    }).catch(console.error);
  }, []);

  if (!user) {
    return <div className="p-8 text-center text-slate-500 font-medium">Please log in to create a post.</div>;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post("/posts", { title, content, roomId });
      toast.success("Successfully created post.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create post.");
    }
  };

  const modules = {
    toolbar: [
      ['bold', 'italic'],
      [{ 'list': 'bullet' }],
      ['image']
    ],
  };

  return (
    <div className="p-8 max-w-4xl mx-auto py-10">
      <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Create New Post</h2>
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a concise title"
                className="w-full focus-visible:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Room</label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id.toString()}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
              {/* @ts-ignore */}
              <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} className="bg-white" />
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-8">Submit Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
