type FormFieldProps = {
    id: string;
    label: string;
    type?: string;
    value: string;
    autoComplete?: string;
    error?: string;
    onChange: (value: string) => void;
};

export default function FormField({
    id,
    label,
    type = 'text',
    value,
    autoComplete,
    error,
    onChange,
}: FormFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                autoComplete={autoComplete}
                onChange={(event) => onChange(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
