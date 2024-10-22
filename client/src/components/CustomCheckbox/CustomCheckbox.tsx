import { Link } from "react-router-dom";
import { IElement } from "../../utils/types";

export default function CustomCheckbox({
  name,
  id,
  type,
  label,
  checked,
  onChange,
  link,
}: IElement) {
  return (
    <div className="flex items-center py-1">
      <input
        className="mr-2 h-5 w-5 cursor-pointer"
        name={name}
        type={type}
        id={id}
        checked={checked}
        onChange={onChange}
        required
      />
      <span className="text-sm font-light text-[#b6b6b6]/75">
        {label}{" "}
        <Link className="text-blue-500 underline" to={name}>
          {link}
        </Link>{" "}
      </span>
    </div>
  );
}
