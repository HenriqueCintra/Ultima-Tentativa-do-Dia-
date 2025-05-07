import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ArrowLeft, House } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";

export const Cadastro = () => {
  const navigate = useNavigate();
  const formFields = [
    { id: "nome", label: "NOME", type: "text" },
    { id: "nickname", label: "NICKNAME", type: "text" },
    { id: "email", label: "EMAIL", type: "email" },
    { id: "data_nascimento", label: "DATA DE NASCIMENTO", type: "date" },
    { id: "senha", label: "SENHA", type: "password" },
    { id: "confirmar_senha", label: "CONFIRMAR SENHA", type: "password" },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
        {/* Nuvens com animação */}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right opacity-75 scale-110"
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
          <ButtonHomeBack onClick={() => navigate("/")}><ArrowLeft/></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/")}><House/></ButtonHomeBack>
        </div>

        {/* Card de Cadastro */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Card className="w-[700px] rounded-[18px] border-2 border-solid border-black bg-white">
            <CardContent className="pt-8 px-[45px]">
              <h1 className="text-center text-[32px] [font-family:'Silkscreen',Helvetica] font-bold mb-8">
                CADASTRO
              </h1>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {formFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[18px]">
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        type={field.type}
                        className="w-full h-[55px] rounded-xl border-2 border-solid border-black bg-white p-3 text-black [font-family:'Silkscreen',Helvetica]"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-between items-center pt-8">
                  <Button 
                    type="submit"
                    className="w-[374px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[24px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105"
                  >
                    CADASTRAR
                  </Button>
                  <a
                      href="/login"
                      onClick={() => navigate("/login")}
                      className="[font-family:'Silkscreen',Helvetica] font-normal mt-4 text-[#167dd2] text-base underline"
                    >
                      Já possui uma conta? Faça login
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};