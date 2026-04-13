import { useState } from "react";
import { api } from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

export const AuthPage = ({ setUser }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      await api.post(endpoint, { username, password });

      const res = await api.get("/auth/me");
      setUser(res.data);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="flex h-[calc(100vh-1px)] w-full items-center justify-center p-8 bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-slate-900 tracking-tight">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm py-2.5">
              {isLogin ? "Log In" : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-slate-500 mt-4 cursor-pointer hover:text-slate-700 transition-colors" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
