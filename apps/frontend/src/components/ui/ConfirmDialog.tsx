import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  onConfirm,
  onCancel,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          button: "bg-red-500 hover:bg-red-600 text-white",
          bg: "bg-red-50",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          button: "bg-amber-500 hover:bg-amber-600 text-white",
          bg: "bg-amber-50",
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-(--primary)" />,
          button:
            "bg-(--primary) hover:bg-(--primary-hover) text-(--primary-fg)",
          bg: "bg-(--color-cream-300)",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-(--foreground)/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-card p-6 overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${styles.bg}`}>{styles.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-(--foreground) font-serif-logo">
                    {title}
                  </h3>
                  <button
                    onClick={onCancel}
                    className="p-1 hover:bg-(--color-cream-300) rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-(--muted-fg)" />
                  </button>
                </div>
                <p className="text-(--muted-fg) leading-relaxed">{message}</p>
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl font-semibold text-(--muted-fg) hover:bg-(--color-cream-300) transition-all active:scale-95"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${styles.button}`}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
