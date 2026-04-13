import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./lib/axios";
import { LayoutGrid, Cpu, Trophy, Popcorn, BookOpen, MessageSquare, LogOut, Plus, Search, Menu } from "lucide-react";
import { Button } from "./components/ui/button";
import { AuthPage } from "./pages/AuthPage";
import { FeedPage } from "./pages/FeedPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { Input } from "./components/ui/input";
import { Toaster, toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./components/ui/dialog";
import type { User, Room } from "./types";

interface SidebarProps {
  user: User | null;
  setUser: (u: User | null) => void;
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}

const Sidebar = ({ user, setUser, isOpen, setIsOpen }: SidebarProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentRoomId = searchParams.get("roomId");

  useEffect(() => {
    api.get("/rooms").then((res) => setRooms(res.data)).catch(console.error);
  }, []);

  const getRoomIcon = (name: string) => {
    switch (name) {
      case 'Technology': return <Cpu className="w-4 h-4" />;
      case 'Sports': return <Trophy className="w-4 h-4" />;
      case 'Entertainment': return <Popcorn className="w-4 h-4" />;
      case 'Education': return <BookOpen className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed md:sticky top-0 left-0 h-screen w-64 border-r border-slate-200 bg-white flex flex-col p-6 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div>
          <Link to="/" onClick={() => setIsOpen(false)}>
            <h1 className="text-2xl font-black mb-8 text-slate-900 tracking-tighter uppercase">Webboard</h1>
          </Link>
          <nav className="space-y-1">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 font-medium rounded-md transition-colors ${!currentRoomId && location.pathname === '/' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutGrid className="w-4 h-4" /> All Posts
            </Link>
            <div className="pt-6 pb-2 font-semibold text-slate-500 text-xs tracking-wider">ROOMS</div>
            {rooms.map(room => {
              const isActive = currentRoomId === room.id.toString();
              return (
                <Link
                  key={room.id}
                  to={`/?roomId=${room.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center gap-2 px-3 py-2 font-medium rounded-md transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span className={isActive ? "text-teal-600" : "text-slate-500"}>{getRoomIcon(room.name)}</span> {room.name}
                  {room.description && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 w-max max-w-xs md:block hidden leading-tight">
                      <div className="absolute top-1/2 -translate-y-1/2 right-full border-[5px] border-transparent border-r-slate-900"></div>
                      {room.description}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto">
          {user ? (
            <div>
              <p className="font-medium text-sm mb-3 text-slate-700">Hello, {user.username}</p>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={async () => {
                await api.post('/auth/logout');
                setUser(null);
                toast.success("Successfully logged out.");
              }}><LogOut className="w-4 h-4" /> Log Out</Button>
            </div>
          ) : (
            <Link to="/auth" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm">Log In / Sign Up</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

const TopHeader = ({ setSidebarOpen, user }: { setSidebarOpen: any, user: User | null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/');
    }
  };

  const handleCreatePostClick = () => {
    if (user) {
      navigate('/create');
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <>
      {location.pathname == '/' && (
        <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center px-4 md:px-8 shadow-sm">
          <div className="flex items-center flex-1 max-w-lg gap-4">
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSidebarOpen((prev: boolean) => !prev)}>
              <Menu className="w-5 h-5" />
            </Button>

            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search discussions..."
                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-teal-500 w-full"
              />
            </form>

          </div>
          <div className="ml-4 shrink-0">
            <Button onClick={handleCreatePostClick} className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-medium px-4 md:px-5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Create Post</span>
            </Button>
          </div>
        </header>
      )}

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the conversation</DialogTitle>
            <DialogDescription>
              You need an account to share your thoughts and create posts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" className="w-full sm:w-1/2" onClick={() => { setAuthDialogOpen(false); navigate('/auth'); }}>
              Sign Up
            </Button>
            <Button className="w-full sm:w-1/2 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { setAuthDialogOpen(false); navigate('/auth'); }}>
              Log In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="flex bg-stone-50 min-h-screen text-slate-800">
      {!isAuthPage && <Sidebar user={user} setUser={setUser} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
      <main className="flex-1 w-full max-w-full flex flex-col min-w-0">
        {!isAuthPage && <TopHeader setSidebarOpen={setSidebarOpen} user={user} />}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/auth" element={<AuthPage setUser={setUser} />} />
            <Route path="/create" element={<CreatePostPage user={user} />} />
            <Route path="/posts/:id" element={<PostDetailPage user={user} />} />
          </Routes>
        </div>
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App;
