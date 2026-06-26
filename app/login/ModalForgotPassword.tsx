import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ModalForgotPassword() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3" variant="link">
          Esqueceu sua senha?
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recuperar Senha</DialogTitle>
          <DialogDescription>
            Digite seu e-mail para receber instruções de recuperação.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input placeholder="exemplo@email.com" />
          <Button className="bg-gold" type="submit">
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
