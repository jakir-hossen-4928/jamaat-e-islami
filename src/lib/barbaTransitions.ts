import barba from '@barba/core';

export const initBarbaTransitions = () => {
  // Initialize Barba.js
  barba.init({
    transitions: [
      {
        name: 'default-transition',
        leave(data) {
          return new Promise<void>((resolve) => {
            const current = data.current.container;
            
            // Fade out animation
            current.style.transition = 'opacity 0.3s ease-out';
            current.style.opacity = '0';
            
            setTimeout(() => {
              resolve();
            }, 300);
          });
        },
        
        enter(data) {
          return new Promise<void>((resolve) => {
            const next = data.next.container;
            
            // Set initial state
            next.style.opacity = '0';
            next.style.transform = 'translateY(20px)';
            next.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            
            // Trigger animation
            setTimeout(() => {
              next.style.opacity = '1';
              next.style.transform = 'translateY(0)';
              
              setTimeout(() => {
                resolve();
              }, 400);
            }, 50);
          });
        }
      },
      
      {
        name: 'slide-transition',
        from: { route: ['/dashboard', '/admin'] },
        to: { route: ['/docs'] },
        leave(data) {
          return new Promise<void>((resolve) => {
            const current = data.current.container;
            
            current.style.transition = 'transform 0.5s ease-in-out';
            current.style.transform = 'translateX(-100%)';
            
            setTimeout(() => {
              resolve();
            }, 500);
          });
        },
        
        enter(data) {
          return new Promise<void>((resolve) => {
            const next = data.next.container;
            
            next.style.transform = 'translateX(100%)';
            next.style.transition = 'transform 0.5s ease-in-out';
            
            setTimeout(() => {
              next.style.transform = 'translateX(0)';
              
              setTimeout(() => {
                resolve();
              }, 500);
            }, 50);
          });
        }
      }
    ],
    
    views: [
      {
        namespace: 'documentation',
        beforeEnter() {
          // Add specific styles for documentation pages
          document.body.classList.add('documentation-page');
        },
        beforeLeave() {
          document.body.classList.remove('documentation-page');
        }
      },
      
      {
        namespace: 'dashboard',
        beforeEnter() {
          document.body.classList.add('dashboard-page');
        },
        beforeLeave() {
          document.body.classList.remove('dashboard-page');
        }
      }
    ]
  });

  // Add loading indicator
  barba.hooks.before(() => {
    const loader = document.createElement('div');
    loader.id = 'barba-loader';
    loader.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 4px; 
        background: linear-gradient(90deg, #16a34a, #22c55e); 
        z-index: 9999;
        animation: slide 0.5s ease-in-out;
      "></div>
    `;
    document.body.appendChild(loader);
  });

  barba.hooks.after(() => {
    const loader = document.getElementById('barba-loader');
    if (loader) {
      loader.remove();
    }
  });

  // Scroll to top on page change
  barba.hooks.enter(() => {
    window.scrollTo(0, 0);
  });
};

// CSS animations for smooth transitions
export const addTransitionStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slide {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    
    .documentation-page {
      background-color: #f9fafb;
    }
    
    .dashboard-page {
      background-color: #f3f4f6;
    }
    
    [data-barba="container"] {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
};
