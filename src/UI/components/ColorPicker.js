import React, { useState, useEffect } from 'react';

const ColorPicker = ({ initialColor = '#000000', onChange }) => {
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    setColor(initialColor);
  }, [initialColor]);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="color-picker">
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
        style={{
          width: '30px',
          height: '30px',
          padding: 0,
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
      />
    </div>
  );
};

export default ColorPicker;