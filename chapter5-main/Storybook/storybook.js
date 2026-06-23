/* Cinematic Storybook Interactions — Chapter 5 */

document.addEventListener('DOMContentLoaded', () => {
  const scenes = document.querySelectorAll('.scene');
  const body = document.body;

  // The shared archive stylesheet keeps pages hidden until this class is set.
  body.classList.add('page-ready');

  // Scene Observer to handle overarching background & state changes
  const sceneObserverOpts = {
    root: null,
    rootMargin: '-10% 0px -10% 0px',
    threshold: 0
  };

  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Handle Body State Classes for Background FX
        const sceneId = entry.target.id;
        if (sceneId) {
          const num = sceneId.split('-')[1];
          // Clear previous scene state classes while preserving global page classes.
          body.classList.remove('s1-active', 's2-active', 's3-active', 's4-active', 's5-active', 's6-active', 's7-active');
          body.classList.add(`s${num}-active`);
          
          // Custom Trigger for Scene 7 Realization
          if (num === '7' && !entry.target.dataset.triggered) {
            entry.target.dataset.triggered = "true";
            triggerFinalRealization(entry.target);
          }
        }
      }
    });
  }, sceneObserverOpts);

  scenes.forEach(scene => sceneObserver.observe(scene));

  // Stagger Observer to handle individual text blocks appearing
  const staggerElements = document.querySelectorAll('.stagger, .stagger-fast');
  const staggerObserverOpts = {
    root: null,
    rootMargin: '-10% 0px -10% 0px',
    threshold: 0.1
  };

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // slight delay based on document order if they appear simultaneously, handled via smooth transition
        entry.target.classList.add('in-view');
        staggerObserver.unobserve(entry.target); // only animate once
      }
    });
  }, staggerObserverOpts);

  staggerElements.forEach(el => staggerObserver.observe(el));

  const archiveBtn = document.getElementById('enter-archive-btn');
  if (archiveBtn) {
    archiveBtn.addEventListener('click', () => {
      try {
        sessionStorage.setItem('rv_storybook_seen', '1');
      } catch (e) {
        // Session storage unavailable; the archive still loads directly.
      }
    });
  }
});

// Sequenced text reveal for Scene 7
function triggerFinalRealization(scene) {
  const lines = scene.querySelectorAll('.reveal-line');
  lines.forEach((line, index) => {
    // Faster cadence for the final reveal so it lands with more momentum.
    let delay = index * 650;
    
    // Extra dramatic pause before the final verdict
    if (line.classList.contains('verdict')) {
      delay += 900; 
    }
    // Action button appears after the verdict is fully digested
    if (line.classList.contains('action-row')) {
      delay += 1400;
    }

    setTimeout(() => {
      line.classList.add('shown');
    }, delay);
  });
}
