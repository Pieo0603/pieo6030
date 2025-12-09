import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Snowflakes configuration
    const snowflakes: { x: number; y: number; radius: number; speed: number; wind: number; opacity: number }[] = [];
    const numFlakes = 200; // Số lượng tuyết

    for (let i = 0; i < numFlakes; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5, // Kích thước từ 0.5 đến 2.5
        speed: Math.random() * 1 + 0.5,  // Tốc độ rơi
        wind: (Math.random() - 0.5) * 0.5, // Gió thổi nhẹ
        opacity: Math.random() * 0.5 + 0.3 // Độ mờ
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background gradient (Giữ màu nền tối)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f0c29');   // Deep night blue
      gradient.addColorStop(0.5, '#302b63'); // Purple hint
      gradient.addColorStop(1, '#24243e');   // Dark finish
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw snowflakes
      ctx.fillStyle = 'white';
      snowflakes.forEach(flake => {
        ctx.beginPath();
        // Hiệu ứng bóng mờ để tuyết trông mềm mại hơn
        ctx.shadowBlur = 5;
        ctx.shadowColor = "rgba(255,255,255,0.8)";
        
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        // Update position (Falling down)
        flake.y += flake.speed;
        flake.x += flake.wind;

        // Reset if out of screen
        if (flake.y > height) {
          flake.y = -5;
          flake.x = Math.random() * width;
        }
        if (flake.x > width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = width;
        }
      });
      
      // Reset shadow for performance
      ctx.shadowBlur = 0;

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default StarBackground;