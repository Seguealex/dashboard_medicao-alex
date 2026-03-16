// src/pages/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else if (data.session) {
      navigate("/admin");
    }
  };

  return (
    <div
      className="flex items-start justify-center min-h-screen bg-cover"
      style={{
        backgroundImage: `url('/veolia.jpg')`,
        backgroundPosition: "center 5%" /* Aumente para 30% ou 40% se precisar que ela desça/suba mais */
      }}
    >
      {/* Botão Dashboard */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Button>
      </div>

      {/* Card com blur */}
      <div className="bg-black/50 backdrop-blur-md rounded-lg w-full max-w-md p-0.2 mt-120 sm:mt-100">
        {/* Aqui você controla a transparência do formulário (bg-black/60 significa 60% de opacidade) */}
        <Card className="bg-black/10 text-yellow-400 rounded-lg shadow-lg border-yellow-400/20">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-yellow-400/30 text-yellow-400 placeholder:text-yellow-400/50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-yellow-400/30 text-yellow-400 placeholder:text-yellow-400/50"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}