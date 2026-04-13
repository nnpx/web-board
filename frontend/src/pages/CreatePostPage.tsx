import { useState, useEffect, useRef, useMemo } from "react";
import { api } from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import type { User, Room } from "../types";

export const CreatePostPage = ({ user }: { user: User | null }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const quillRef = useRef<any>(null);
  const [roomId, setRoomId] = useState("1");
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageInsertionIndex, setImageInsertionIndex] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const imageHandler = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      setImageInsertionIndex(range ? range.index : quill.getLength() || 0);
    }
    setImageUrlInput("");
    setIsImageModalOpen(true);
  };

  const handleImageSubmit = () => {
    if (imageUrlInput && quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.insertEmbed(imageInsertionIndex, 'image', imageUrlInput);
      setTimeout(() => quill.setSelection(imageInsertionIndex + 1), 0);
    }
    setIsImageModalOpen(false);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        ['bold', 'italic'],
        [{ 'list': 'bullet' }],
        ['image']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

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
              <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} className="bg-white" ref={quillRef} />
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-8">Submit Post</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image URL</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="https://example.com/beautiful-sunset.jpg"
              className="w-full focus-visible:ring-teal-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleImageSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleImageSubmit}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
