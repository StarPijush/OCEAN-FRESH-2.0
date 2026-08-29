interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  const htmlId = id ?? `cb-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <label className="checkbox-container" htmlFor={htmlId}>
      <input
        id={htmlId}
        className="custom-checkbox"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkmark" aria-hidden="true" />
      <span className="checkbox-label">{label}</span>
    </label>
  );
}
