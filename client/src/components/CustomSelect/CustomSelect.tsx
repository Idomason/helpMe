interface CustomSelectProps {
  element: {
    name: string;
    label: string;
    type: string;
    options?: string[];
    id?: string;
  };
  formData: Record<string, any>;
  onFormData: (name: string, value: string) => void;
}

export default function CustomSelect({
  element,
  formData,
  onFormData,
}: CustomSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFormData(element.name, e.target.value);
  };

  return (
    <>
      <label className="block pb-3 text-left" htmlFor={element.name}>
        {element.label}
      </label>
      <select
        className="mb-1.5 w-full rounded bg-[#5d87f0] px-3 py-1.5 outline-none focus:bg-[#b6b6b6] focus:text-[#242323] focus:ring-1 focus:ring-[#f5f5f6]"
        value={formData[element.name] || ""}
        onChange={handleChange}
        name={element.name}
        id={element.name}
        disabled={false}
      >
        <option className="" value="" disabled>
          Select a role
        </option>
        <option className="" value="helpee">
          Helpee
        </option>
        <option className="" value="helper">
          Helper
        </option>
      </select>
    </>
  );
}
