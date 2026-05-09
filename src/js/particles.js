/* Particles — 背景粒子 (Warm amber + deep blue) */

export function initParticles(canvas) {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h;
  let particles = [];
  const COUNT = 80;
  let animationId;

  // 处理高 DPI 屏幕清晰度
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;

    // 设置显示大小
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // 设置实际渲染大小
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    // 缩放上下文以匹配
    ctx.scale(dpr, dpr);
  }

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      // 2. 加快移动速度
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      // 3. 增大粒子半径 (1.5 ~ 3.5)
      r: Math.random() * 1.5 + 0.5,
      // 4. 提高透明度 (0.4 ~ 0.8)
      alpha: Math.random() * 0.4 + 0.4,
      color: Math.random() > 0.6 ? '#e8863a' : '#4a5048'
    };
  }

  function init() {
    // 清除之前的状态（防止重复调用导致多重动画）
    if (animationId) cancelAnimationFrame(animationId);
    particles = [];

    resize();
    for (let i = 0; i < COUNT; i++) particles.push(createParticle());

    // 避免重复绑定 resize
    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resize);

    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // 更新并绘制粒子
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // 边界反弹或环绕（当前是环绕）
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    // 绘制连线
    ctx.lineWidth = 0.7;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) { // 稍微减小连接距离，减少视觉杂乱
          ctx.strokeStyle = '#f8f8f8';
          ctx.globalAlpha = 0.15 * (1 - dist / 120);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    animationId = requestAnimationFrame(animate);
  }

  init();
}