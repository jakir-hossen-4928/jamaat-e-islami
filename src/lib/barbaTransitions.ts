
// Disabled Barba.js integration for React compatibility
// Using CSS transitions instead for smooth page changes

export const initBarbaTransitions = () => {
  // Barba.js is disabled to prevent conflicts with React Router
  console.log('Barba.js transitions disabled - using React transitions instead');
};

export const addTransitionStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Page transition styles */
    .page-enter {
      opacity: 0;
      transform: translateY(10px);
    }
    
    .page-enter-active {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }
    
    .page-exit {
      opacity: 1;
      transform: translateY(0);
    }
    
    .page-exit-active {
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 0.2s ease-in, transform 0.2s ease-in;
    }
    
    /* Smooth transitions for route changes */
    [data-barba="container"] {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    }
    
    .documentation-page {
      background-color: #f9fafb;
    }
    
    .dashboard-page {
      background-color: #f3f4f6;
    }
  `;
  document.head.appendChild(style);
};
