import React, { useEffect, useRef, useState } from 'react';
import Typed from 'typed.js';

const TypingComponent = () => {
  // Create references to store DOM elements and state
  const el = useRef(null);
  // Create reference to store the Typed instance itself
  const typed = React.useRef(null);
  const [colorIndex, setColorIndex] = useState(0);
  const colors = ['#b700ff', '#00ffff', '#00ff77', '#ff4000']; // Array of colors

  useEffect(() => {
     typed.current = new Typed(el.current, {
      strings: ['Freelancer', 'AI Engineer', 'YouTuber', 'Developer'],
      typeSpeed: 55,
      backSpeed: 40,
    preStringTyped: (arrayPos, self) => {
          setColorIndex((prevIndex) => (prevIndex + 1) % colors.length)
      },
    });

    return () => {
      typed.current.destroy();
    };
  }, []);


  // Apply the current color to textShadow
  const currentColor = colors[colorIndex];
  const textShadow = `0 0 1px ${currentColor}, 0 0 1px ${currentColor}, 0 0 1px ${currentColor}`;

  return (
    <div style={{ color: '#3c3c3c', fontWeight: '800', lineHeight: '170px' }}>
      <h1 style={{ color: currentColor }}>
        <span style={{ color: '#3c3c3c' }}> Hi, I'm </span>
        <span
          ref={el}
          style={{
            fontWeight: '800',
            letterSpacing: '2px',
            textShadow,
          }}
        />
      </h1>
    </div>
  );
};

export default TypingComponent;
