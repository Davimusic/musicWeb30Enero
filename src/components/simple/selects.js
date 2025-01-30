import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

export default function Select({id, name, value, options, event, style, className}) {
    return (
        <select id={id} style={style} className={extractArrayContentToStrings(className)} name={name} value={value} onChange={event}>
            {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}