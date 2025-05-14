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
import { ArrowLeft, House } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 

  const renderEmailScreen = () => (
    <Card className="w-[700px] h-auto rounded-[18px] border-2 border-solid border-black bg-white">
      <CardHeader className="pb-0">
        <CardTitle className="text-[35px] text-center [font-family:'Silkscreen',Helvetica] font-bold">
          ESQUECI A SENHA
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 px-[45px]">
        <form className="space-y-2">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
            >
              CONFIRME O EMAIL
            </label>
            <Input
              id="email"
              type="email"
              placeholder="teste@email.com"
              className="h-[55px] rounded-xl border border-solid border-black"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setStep(2)}
              className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105"
            >
              ENVIAR
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderNewPasswordScreen = () => (
    <Card className="w-[700px] h-auto rounded-[18px] border-2 border-solid border-black bg-white">
      <CardHeader className="pb-0">
        <CardTitle className="text-[35px] text-center [font-family:'Silkscreen',Helvetica] font-bold">
          ESQUECI A SENHA
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 px-[45px]">
        <form className="space-y-2">
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
            >
              NOVA SENHA
            </label>
            <Input
              id="newPassword"
              type="password"
              className="h-[55px] rounded-xl border border-solid border-black"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
            >
              CONFIRME A SENHA
            </label>
            <Input
              id="confirmPassword"
              type="password"
              className="h-[55px] rounded-xl border border-solid border-black"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => navigate("/login")}
              className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105"
            >
              ALTERAR
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
        {}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right"
          alt="Cloud decoration"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Cloud decoration"
          src="/nuvemright.png"
        />

        {}
        <div className="flex gap-5 absolute top-14 left-[33px]">
          <ButtonHomeBack onClick={() => navigate("/login")}><ArrowLeft/></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/")}><House/></ButtonHomeBack>
        </div>

        {}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {step === 1 ? renderEmailScreen() : renderNewPasswordScreen()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;