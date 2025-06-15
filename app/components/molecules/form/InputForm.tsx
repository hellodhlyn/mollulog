import { HTMLInputTypeAttribute, useRef } from "react";

type InputFormProps = {
  label: string;
  type?: HTMLInputTypeAttribute;
  name?: string;
  defaultValue?: string;
  description?: string;
  placeholder?: string;
  error?: string;
};

export default function InputForm({ label, type, name, defaultValue, description, placeholder, error }: InputFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4" onClick={() => inputRef.current?.focus()}>
      <label className="font-bold">{label}</label>
      <p className="text-sm">{description}</p>
      <div className="mt-2 text-neutral-500 dark:text-neutral-400">
        <input
          ref={inputRef}
          type={type}
          name={name}
          defaultValue={defaultValue}
          className="w-full"
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
