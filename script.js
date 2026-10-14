// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Expandable skill categories
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    const items = document.getElementById(cat);
    const isOpen = items.classList.contains('open');
    
    // Close all
    document.querySelectorAll('.skill-items').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('open'));
    
    if (!isOpen) {
      items.classList.add('open');
      btn.classList.add('open');
    }
  });
});

// Open first category by default
document.querySelector('.category-btn').click();

// Tooltip for skill items
const tooltip = document.getElementById('tooltip');

document.querySelectorAll('.skill-item[data-note]').forEach(item => {
  item.addEventListener('mouseenter', (e) => {
    const note = item.dataset.note;
    if (!note) return;
    tooltip.textContent = note;
    tooltip.classList.add('visible');
  });

  item.addEventListener('mousemove', (e) => {
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY + 12) + 'px';
  });

  item.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
});

// Smooth reveal on scroll (simple)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(20px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});
