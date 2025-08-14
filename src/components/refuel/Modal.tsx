import React from "react";
// CORREÇÃO: A linha de importação da imagem foi REMOVIDA.

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, title, message }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* CORREÇÃO: Usando caminho absoluto a partir da pasta public */}
        <img src="/alerta.png" alt="Alerta" className="modal-image" />
        <h2 className="penalty-title">{title}</h2>
        <p className="penalty-message">{message}</p>
        <button onClick={onClose} className="btn">
          ENTENDI
        </button>
      </div>
    </div>
  );
};

export default Modal;
