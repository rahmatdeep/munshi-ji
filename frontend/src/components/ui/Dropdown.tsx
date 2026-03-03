import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, X, Check } from "lucide-react";

interface DropdownOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  searchable = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-(--muted-fg) mb-1.5 ml-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full glass-input flex items-center justify-between gap-2 text-left group transition-all duration-300 ${
          isOpen ? "ring-4 ring-(--primary)/15 border-(--primary)" : ""
        }`}
      >
        <span
          className={`block truncate ${!selectedOption ? "text-(--muted-fg)" : "text-(--foreground)"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-(--muted-fg) transition-transform duration-300 ${
            isOpen
              ? "rotate-180 text-(--primary)"
              : "group-hover:text-(--foreground)"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 glass-card overflow-hidden shadow-2xl border-(--card-border)/50"
          >
            {searchable && (
              <div className="p-2 border-b border-(--card-border)/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted-fg)" />
                  <input
                    type="text"
                    className="w-full bg-(--color-cream-300) border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-(--primary)/20 transition-all outline-none"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-(--color-tan-500)/20 rounded-full"
                    >
                      <X className="w-3 h-3 text-(--muted-fg)" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto p-1 py-2 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                      value === option.value
                        ? "bg-(--primary) text-(--primary-fg) font-semibold"
                        : "text-(--foreground) hover:bg-(--primary)/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <span
                          className={
                            value === option.value
                              ? "text-white"
                              : "text-(--muted-fg)"
                          }
                        >
                          {option.icon}
                        </span>
                      )}
                      <span>{option.label}</span>
                    </div>
                    {value === option.value && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-(--muted-fg)">No options found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
