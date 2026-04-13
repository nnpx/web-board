import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { Button } from "../components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { Textarea } from "../components/ui/textarea";
import { getRoomColor } from "./FeedPage";
import { User, UserCircle2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const PostDetailPage = ({ user }: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [inlineReplyContent, setInlineReplyContent] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  const loadData = async () => {
    try {
      const pRes = await api.get(`/posts/${id}`);
      setPost(pRes.data);
      const rRes = await api.get(`/posts/${id}/replies`);
      setReplies(rRes.data);
    } catch (err: any) {
      if (err.response?.status === 404) navigate("/");
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await api.delete(`/posts/${id}`);
      toast.success("Successfully deleted post.");
      navigate("/");
    }
  };

  const handleReply = async () => {
    if (!replyContent) return;
    try {
      await api.post(`/posts/${id}/replies`, { content: replyContent });
      setReplyContent("");
      toast.success("Successfully created reply.");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post reply.");
    }
  };

  const handleInlineReplyOpen = (reply: any, isChild: boolean) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setActiveReplyId(reply.id);
    if (isChild) {
      setInlineReplyContent(`@${reply.username} `);
    } else {
      setInlineReplyContent("");
    }
  };

  const handleSubmitInlineReply = async (topParentId: string) => {
    if (!inlineReplyContent) return;
    try {
      await api.post(`/posts/${id}/replies`, { content: inlineReplyContent, parentId: topParentId });
      setInlineReplyContent("");
      setActiveReplyId(null);
      toast.success("Successfully created reply.");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to post reply.");
    }
  };

  const handleEditStart = (reply: any) => {
    setEditingReplyId(reply.id);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = reply.content;
    setEditReplyContent(tempDiv.textContent || tempDiv.innerText || "");
  };

  const handleEditSubmit = async (replyId: string) => {
    if (!editReplyContent) return;
    try {
      await api.put(`/replies/${replyId}`, { content: editReplyContent });
      setEditingReplyId(null);
      toast.success("Successfully updated reply.");
      loadData();
    } catch (err) {
      toast.error("Failed to update reply.");
    }
  };

  const handleReplyDelete = async (replyId: string) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await api.delete(`/replies/${replyId}`);
      toast.success("Successfully deleted reply.");
      loadData();
    } catch (err) {
      toast.error("Failed to delete reply.");
    }
  };

  if (!post) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const roomTheme = getRoomColor(post.roomName);
  const topLevelReplies = replies.filter(r => !r.parentId);

  const ReplyEditorUI = ({ topParentId }: { topParentId: string }) => (
    <div className="mt-4 bg-slate-50 p-4 border border-slate-200 rounded-lg">
      <Textarea value={inlineReplyContent} onChange={(e) => setInlineReplyContent(e.target.value)} placeholder="Type your reply..." className="bg-white" />
      <div className="flex justify-end mt-3 space-x-3">
        <Button variant="ghost" onClick={() => { setActiveReplyId(null); setInlineReplyContent(''); }}>Cancel</Button>
        <Button onClick={() => handleSubmitInlineReply(topParentId)} className="bg-teal-600 hover:bg-teal-700 text-white">Post Reply</Button>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Original Post */}
      <div className="bg-white rounded-xl shadow-sm border-0 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{post.title}</h1>
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 whitespace-nowrap ${roomTheme.color}`}>
              {roomTheme.icon}{post.roomName}
            </span>
          </div>
          <div className="flex items-center text-sm text-slate-500 mb-8 space-x-4 font-medium border-b border-slate-100 pb-6">
            <div className="flex items-center space-x-2">
              <UserCircle2 className="w-8 h-8 text-slate-300" />
              <span>Posted by <span className="font-semibold text-slate-900">{post.username}</span></span>
            </div>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{post.viewsCount} views</span>
          </div>

          <div className="prose max-w-none text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />

          <style>{`.prose img { max-width: 100%; height: auto; border-radius: 8px; margin-top: 1rem; }`}</style>

          {user && user.id === post.userId && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <Button variant="destructive" onClick={handleDelete}>Delete Post</Button>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      <div className="bg-white rounded-xl shadow-sm border-0 p-8">
        <h3 className="text-xl font-bold mb-6 tracking-tight text-slate-900">Replies ({replies.length})</h3>

        {topLevelReplies.length > 0 ? (
          <div className="flex flex-col space-y-2">
            {topLevelReplies.map((topReply) => {
              const children = replies.filter(r => r.parentId === topReply.id);

              return (
                <div key={topReply.id} className="py-6 border-b border-slate-100 last:border-0 divide-y-0">
                  <div className="flex space-x-4">
                    <div className="shrink-0 mt-1">
                      <User className="w-8 h-8 bg-slate-100 p-1.5 rounded-full text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start w-full">
                        <div className="flex text-sm text-slate-500 mb-2 space-x-3 font-medium items-center">
                          <span className="font-semibold text-slate-900">{topReply.username}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs">{new Date(topReply.createdAt).toLocaleDateString()}</span>
                        </div>
                        {user && user.id === topReply.userId && (
                          <div className="flex items-center space-x-1 shrink-0 ml-4">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-teal-600" onClick={() => handleEditStart(topReply)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => handleReplyDelete(topReply.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingReplyId === topReply.id ? (
                        <div className="mt-2">
                          <Textarea value={editReplyContent} onChange={e => setEditReplyContent(e.target.value)} className="bg-white mb-3" />
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingReplyId(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleEditSubmit(topReply.id)} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="prose max-w-none text-slate-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: topReply.content }} />
                      )}

                      {editingReplyId !== topReply.id && (
                        <div className="mt-2">
                          <button onClick={() => handleInlineReplyOpen(topReply, false)} className="text-sm text-slate-400 hover:text-slate-600 font-semibold transition-colors">Reply</button>
                        </div>
                      )}
                      {activeReplyId === topReply.id && (
                        <ReplyEditorUI topParentId={topReply.id} />
                      )}
                    </div>
                  </div>

                  {children.length > 0 && (
                    <div className="ml-12 border-l-2 border-slate-200 pl-4 mt-6 space-y-6">
                      {children.map(child => (
                        <div key={child.id} className="flex space-x-4">
                          <div className="shrink-0 mt-1">
                            <User className="w-6 h-6 bg-slate-100 p-1 rounded-full text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start w-full">
                              <div className="flex text-sm text-slate-500 mb-2 space-x-3 font-medium items-center">
                                <span className="font-semibold text-slate-900">{child.username}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs">{new Date(child.createdAt).toLocaleDateString()}</span>
                              </div>
                              {user && user.id === child.userId && (
                                <div className="flex items-center space-x-1 shrink-0 ml-4">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-teal-600" onClick={() => handleEditStart(child)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600" onClick={() => handleReplyDelete(child.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {editingReplyId === child.id ? (
                              <div className="mt-2">
                                <Textarea value={editReplyContent} onChange={e => setEditReplyContent(e.target.value)} className="bg-white mb-3" />
                                <div className="flex justify-end space-x-2">
                                  <Button variant="ghost" size="sm" onClick={() => setEditingReplyId(null)}>Cancel</Button>
                                  <Button size="sm" onClick={() => handleEditSubmit(child.id)} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="prose max-w-none text-slate-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: child.content }} />
                            )}

                            {editingReplyId !== child.id && (
                              <div className="mt-2">
                                <button onClick={() => handleInlineReplyOpen(child, true)} className="text-sm text-slate-400 hover:text-slate-600 font-semibold transition-colors">Reply</button>
                              </div>
                            )}
                            {activeReplyId === child.id && (
                              <ReplyEditorUI topParentId={topReply.id} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-500 text-sm py-4">No replies yet.</div>
        )}

        {/* Add Reply */}
        <div className="mt-8 border-t border-slate-100 pt-8">
          {user ? (
            <div>
              <h4 className="font-bold mb-4 text-slate-900 tracking-tight">Add a Reply</h4>
              <div className="mb-4 bg-white">
                <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Type your reply here..." className="min-h-[120px]" />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleReply} className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6">Post Reply</Button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 font-medium">
              Please log in to reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
