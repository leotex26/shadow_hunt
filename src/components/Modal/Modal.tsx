import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import "./Modal.css";

interface ModalProps {
  // Nom lu par les lecteurs d'écran (la fenêtre n'a pas toujours de titre
  // visible, par exemple quand elle affiche les règles avec leur propre h1).
  label: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

// Fenêtre au-dessus de la partie. Se ferme avec Échap ou en cliquant à
// côté, et rend le focus au bouton qui l'a ouverte.
function Modal({ label, onClose, children, wide = false }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className={`modal ${wide ? "modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        // Un clic dans la fenêtre ne doit pas la fermer.
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
