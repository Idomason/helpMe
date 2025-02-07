export default function CustomSelect({ element, formData, onFormData }) {
  return (
    <>
      <label className="block pb-3 text-left" htmlFor="role">
        {element.label}
      </label>
      <select
        className="mb-1.5 w-full rounded bg-[#5d87f0] px-3 py-1.5 outline-none focus:bg-[#b6b6b6] focus:text-[#242323] focus:ring-1 focus:ring-[#f5f5f6]"
        value={formData.role}
        onChange={onFormData}
        name={element.name}
        id={element.id}
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
