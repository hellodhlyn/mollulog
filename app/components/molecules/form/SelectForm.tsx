import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import hangul from "hangul-js";
import { useFormGroup } from "~/components/organisms/form/FormGroup";

type SelectFormProps = {
  label: string;
  description?: string;
  name: string;
  options: {
    label: string;
    labelImageUrl?: string;
    value: string;
  }[];
  initialValue?: string;
  placeholder?: string;
  useSearch?: boolean;
};

export default function SelectForm({ label, description, name, initialValue, placeholder, options, useSearch }: SelectFormProps) {
  const { submitFormGroup } = useFormGroup();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const selectedLabel = options.find((option) => option.value === selectedValue)?.label;
  const filteredOptions = options.filter((option) =>
    hangul.search(option.label, debouncedSearchQuery) >= 0
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      <div className="p-4 cursor-pointer relative" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-x-2">
          <div className="grow">
            <label className="font-bold">{label}</label>
            {description && <p className="text-sm">{description}</p>}
            {(selectedLabel ?? placeholder) && <p className="mt-2 text-neutral-500 dark:text-neutral-400">{selectedLabel ?? placeholder}</p>}
          </div>
          <ChevronDownIcon className="size-4" />
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 w-full max-h-72 overflow-y-auto no-scrollbar bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-b-lg shadow-lg">
            {useSearch && (
              <div className="sticky top-0 p-2 border-b border-neutral-200 dark:border-neutral-800">
                <input
                  type="text"
                  className="w-full p-2"
                  placeholder="검색해서 찾기..."
                  value={searchQuery}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchQuery(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-4 flex items-center gap-x-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-100 cursor-pointer"
                  onClick={() => {
                    setSelectedValue(option.value);
                    setIsOpen(false);
                    setSearchQuery("");
                    submitFormGroup();
                  }}
                >
                  {option.labelImageUrl ? <img src={option.labelImageUrl} alt={option.label} className="size-10 -my-4 rounded-full object-cover" loading="lazy" /> : null}
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-neutral-500 dark:text-neutral-400 text-center">
                검색 결과가 없어요
              </div>
            )}
          </div>
        )}
      </div>
      <input type="hidden" name={name} value={selectedValue} />
    </>
  )
}
