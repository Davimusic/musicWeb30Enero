const CheckBox = ({ checked, onChange }) => {
    return (
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{
            display: 'none',
          }}
        />
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: '2px solid #4CAF50',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background 0.3s, border-color 0.3s',
            background: checked ? '#4CAF50' : 'transparent',
            borderColor: checked ? '#388E3C' : '#4CAF50',
            marginRight: '5px'
          }}
        />
      </label>
    );
  };
  
  export default CheckBox;
  