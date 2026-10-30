// Chuyển bước giữa các Screen
function goToStep(stepNumber) {
  const steps = document.querySelectorAll('.step');
  steps.forEach(step => step.classList.remove('active'));

  const targetStep = document.getElementById(`step${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add('active');
  }
}

// Tạo hiệu ứng trái tim trôi nhẹ ở background
function createHearts() {
  const container = document.getElementById('heartsBg');
  const heartSymbols = ['💙', '🩷', '🤍', '🩵']; // Thêm trái tim hồng và xanh nhạt

  for (let i = 0; i < 18; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-home floating-heart';
    heart.innerText = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = `${4 + Math.random() * 5}s`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    heart.style.fontSize = `${14 + Math.random() * 16}px`;
    container.appendChild(heart);
  }
}

document.addEventListener('DOMContentLoaded', createHearts);