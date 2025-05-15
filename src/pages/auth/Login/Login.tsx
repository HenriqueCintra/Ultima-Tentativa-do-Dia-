
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

export const Login = () => {
  const navigate = useNavigate();
  const formFields = [
    { id: "email", label: "email", type: "email" },
    { id: "password", label: "Senha", type: "password" },
  ];

  const handleForgotPassword = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    navigate("/forgot-password");
  };
  return (
    <div className="bg-white flex flex-row justify-center w-full">
    <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
      {/* Logo images with animation */}
      <img
        className="w-[375px] h-[147px]  absolute top-[120px] left-[157px] object-cover animate-float-right"
        alt="Logo"
        src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px]  absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Logo"
          src="/nuvemright.png"
        />

      {/* Navigation buttons */}
      <div className="flex gap-5 absolute top-14 left-[33px]">
        <ButtonHomeBack onClick={() => navigate("/")}><ArrowLeft/></ButtonHomeBack>
        <ButtonHomeBack onClick={() => navigate("/")}><House/></ButtonHomeBack>
       
      </div>

      {/* Login Card */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Card className="w-[700px] h-auto rounded-[18px] border-2 border-solid border-black bg-white">
          <CardHeader className="pb-0">
            <CardTitle className="text-[35px] text-center [font-family:'Silkscreen',Helvetica] font-bold">
              lOGIN
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 px-[45px]">
            <form className="space-y-2">
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label
                    htmlFor={field.id}
                    className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
                  >
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    type={field.type}
                    className="h-[55px] rounded-xl border border-solid border-black"
                  />
                </div>
              ))}

             

              <div className="flex justify-end">
                <a
                   href="#"
  onClick={handleForgotPassword}
  className="[font-family:'Silkscreen',Helvetica] font-normal text-[#167dd2] text-2xl underline"
>
  esqueci a senha
</a>
              </div>
              <div className="flex justify-between pt-4">
                <Button
                  onClick={() => navigate("/Cadastro")}
                 className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105">
                  Cadastro
                </Button>
                <Button className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105">
                  Login
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