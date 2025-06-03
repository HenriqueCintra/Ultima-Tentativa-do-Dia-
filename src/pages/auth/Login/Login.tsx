import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, House, AlertCircle } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import { useAuth } from "../../../contexts/AuthContext";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleForgotPassword = (e: React.MouseEvent) => {

    e.preventDefault();
    navigate("/forgot-password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!username || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(username, password);
      navigate("/choose-team"); // Navega para a home após login bem-sucedido
    } catch (error: any) {
      console.error("Erro completo de login:", error);

      // Tratamento específico para erro de credenciais inválidas
      if (error.response && error.response.status === 401) {
        setError("Nome de usuário ou senha inválidos");
        return;
      }

      // Tratamento para outros erros com resposta
      if (error.response && error.response.data) {
        // Trata erros da API
        if (error.response.data.detail) {
          setError(error.response.data.detail);
        } else if (typeof error.response.data === 'object') {
          // Extrai mensagens de erro
          try {
            const errorMessages = Object.entries(error.response.data)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  return value.join(", ");
                } else {
                  return `${key}: ${value}`;
                }
              });
            setError(errorMessages.join("; "));
          } catch (e) {
            setError("Falha ao realizar login. Verifique suas credenciais.");
          }
        } else {
          setError("Falha ao realizar login. Verifique suas credenciais.");
        }
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta do servidor
        setError("O servidor não respondeu. Verifique sua conexão.");
      } else {
        // Erro na configuração da requisição
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
        {/* Elementos de Nuvem */}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right"
          alt="Nuvem"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Nuvem"
          src="/nuvemright.png"
        />

        {/* Botões de navegação */}
        <div className="flex gap-5 absolute top-14 left-[33px]">
          <ButtonHomeBack onClick={() => navigate("/")}><ArrowLeft /></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/")}><House /></ButtonHomeBack>
        </div>

        {/* Card de Login */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Card className="w-[700px] h-auto rounded-[18px] border-2 border-solid border-black bg-white">
            <CardHeader className="pb-0">
              <CardTitle className="text-[35px] text-center [font-family:'Silkscreen',Helvetica] font-bold">
                LOGIN
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1 px-[45px]">
              <form className="space-y-2" onSubmit={handleSubmit}>
                {/* Campo de usuário */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
                  >
                    Usuário
                  </label>
                  <Input
                    id="username"
                    type="text"
                    className="h-[55px] rounded-xl border border-solid border-black"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* Campo de senha */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
                  >
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    className="h-[55px] rounded-xl border border-solid border-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Mensagem de erro */}
                {error && (
                  <div className="text-red-500 flex items-center gap-2 my-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Link esqueci senha */}
                <div className="flex justify-end">
                  <a
                    href="#"
                    onClick={handleForgotPassword}
                    className="[font-family:'Silkscreen',Helvetica] font-normal text-[#167dd2] text-2xl underline"
                  >
                    esqueci a senha
                  </a>
                </div>

                {/* Botões */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    onClick={() => navigate("/cadastro")}
                    className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105">
                    Cadastro
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105">
                    {loading ? "Carregando..." : "Login"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};