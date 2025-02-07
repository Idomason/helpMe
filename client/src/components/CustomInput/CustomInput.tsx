import { IElement } from "../../utils/types";

export default function CustomInput({
  label,
  name,
  onChange,
  value,
  placeholder,
  id,
  type,
}: IElement) {
  return (
    <div className="flex items-center justify-center">
      <label htmlFor={name}>{label}</label>
      <input
        className="text-[#b6b6b6]/84 my-1.5 w-80 rounded bg-[#b6b6b6]/20 px-4 py-1.5 outline-none placeholder:text-sm focus:bg-[#b6b6b6] focus:text-[#242323] focus:ring-1 focus:ring-[#f5f5f6]"
        type={type || "text"}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Enter value here"}
        minLength={type === "password" ? 6 : 0}
        required
      />
    </div>
  );
}
