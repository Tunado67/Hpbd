// Chuyển bước giữa các Screen
function goToStep(stepNumber) {
  const steps = document.querySelectorAll('.step');
  steps.forEach(step => step.classList.remove('active'));

  const targetStep = document.getElementById(`step${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add('active');
  }

  // Quản lý hiển thị nút floating music icon:
  // Xuất hiện trên các màn hình tiếp theo (Step 3, 4, 5, 6 - Message/Letter screens)
  const floatingMusicBtn = document.getElementById('floatingMusicBtn');
  if (floatingMusicBtn) {
    if (stepNumber >= 3) {
      floatingMusicBtn.classList.remove('hidden');
    } else {
      floatingMusicBtn.classList.add('hidden');
    }
  }

  // Khi rời khỏi Step 6 (ví dụ Replay về Step 1), reset trạng thái phong bì để có thể mở lại mượt mà
  if (stepNumber !== 6) {
    resetEnvelope();
  }

  // Chú ý: Không dừng âm thanh khi chuyển màn hình để audio phát liên tục (seamless SPA playback)
}

// Reset trạng thái phong bì lá thư
function resetEnvelope() {
  const envelope = document.getElementById('envelope');
  const confettiBurst = document.getElementById('confettiBurst');
  if (envelope) {
    envelope.classList.remove('opened');
  }
  if (confettiBurst) {
    confettiBurst.innerHTML = '';
  }
}

// Hiệu ứng pháo hoa trái tim / confetti khi mở thư
function triggerConfettiBurst() {
  const container = document.getElementById('confettiBurst');
  if (!container) return;
  container.innerHTML = '';

  const particles = ['🎉', '✨', '💖', '⭐', '🌸', '💝', '🎂'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'confetti-particle';
    el.innerText = particles[Math.floor(Math.random() * particles.length)];

    const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.2);
    const distance = 80 + Math.random() * 90;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);
    el.style.animationDelay = `${Math.random() * 0.15}s`;

    container.appendChild(el);
  }

  // Dọn dẹp hạt sau khi hiệu ứng kết thúc
  setTimeout(() => {
    if (container) container.innerHTML = '';
  }, 1200);
}

// Mở thư từ Step 4 với chuỗi hiệu ứng mở phong bì (Opening Effect)
function openLetter() {
  goToStep(6);
  const envelope = document.getElementById('envelope');

  if (envelope) {
    envelope.classList.remove('opened');
    // Bắt đầu mở nắp phong bì và trồi lá thư
    requestAnimationFrame(() => {
      setTimeout(() => {
        envelope.classList.add('opened');
        triggerConfettiBurst();
      }, 100);
    });
  }
}

// Format seconds into m:ss format
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Khởi tạo Audio Player và các Controls (Screen 1 Vinyl Controls + Floating Music Button)
function initAudioPlayer() {
  const audio = document.getElementById('audioPlayer');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const progressBar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');
  const durationTimeEl = document.getElementById('durationTime');
  const vinylRecord = document.getElementById('vinylRecord');
  const recordPlayer = document.querySelector('.record-player');
  const floatingMusicBtn = document.getElementById('floatingMusicBtn');

  if (!audio) return;

  function updatePlayState(isPlaying) {
    if (isPlaying) {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (vinylRecord) {
        vinylRecord.classList.add('playing');
        vinylRecord.classList.add('animate-spin');
      }
      if (recordPlayer) recordPlayer.classList.add('playing');
      if (floatingMusicBtn) {
        floatingMusicBtn.classList.add('active');
        floatingMusicBtn.classList.add('playing');
      }
    } else {
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (vinylRecord) {
        vinylRecord.classList.remove('playing');
        vinylRecord.classList.remove('animate-spin');
      }
      if (recordPlayer) recordPlayer.classList.remove('playing');
      if (floatingMusicBtn) {
        floatingMusicBtn.classList.remove('active');
        floatingMusicBtn.classList.remove('playing');
      }
    }
  }

  // Hàm chuyển đổi trạng thái Play/Pause an toàn cho mobile với .catch()
  function togglePlayPause() {
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            updatePlayState(true);
          })
          .catch(err => {
            console.warn('Playback error / Autoplay blocked:', err);
            updatePlayState(false);
          });
      }
    } else {
      audio.pause();
      updatePlayState(false);
    }
  }

  // Play / Pause toggle trên Screen 1 (Vinyl Player)
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      togglePlayPause();
    });
  }

  // Play / Pause toggle trên Floating Music Button (Screen 2 / các bước sau)
  if (floatingMusicBtn) {
    floatingMusicBtn.addEventListener('click', (e) => {
      e.preventDefault();
      togglePlayPause();
    });
  }

  audio.addEventListener('play', () => updatePlayState(true));
  audio.addEventListener('pause', () => updatePlayState(false));

  // Khi hết bài hát
  audio.addEventListener('ended', () => {
    updatePlayState(false);
    audio.currentTime = 0;
    if (progressBar) progressBar.value = 0;
    if (currentTimeEl) currentTimeEl.innerText = '0:00';
  });

  // Lấy duration chuẩn xác của audio (hỗ trợ Opus khi browser báo infinity)
  function getAudioDuration() {
    if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
      return audio.duration;
    }
    if (audio.seekable && audio.seekable.length > 0) {
      const end = audio.seekable.end(audio.seekable.length - 1);
      if (isFinite(end) && end > 0) return end;
    }
    // Fallback chuẩn 213.56s (3:33) từ Opus header
    return 213.56;
  }

  function updateDurationDisplay() {
    if (!durationTimeEl) return;
    const totalDuration = getAudioDuration();
    durationTimeEl.innerText = formatTime(totalDuration);
  }

  audio.addEventListener('loadedmetadata', updateDurationDisplay);
  audio.addEventListener('durationchange', updateDurationDisplay);
  audio.addEventListener('canplay', updateDurationDisplay);
  updateDurationDisplay();

  // Cập nhật tiến trình phát
  audio.addEventListener('timeupdate', () => {
    const totalDuration = getAudioDuration();
    if (!totalDuration) return;
    const progressPercent = (audio.currentTime / totalDuration) * 100;
    if (progressBar) progressBar.value = Math.min(100, Math.max(0, progressPercent));
    if (currentTimeEl) currentTimeEl.innerText = formatTime(audio.currentTime);
  });

  // Tua nhạc khi kéo hoặc click thanh thời gian
  if (progressBar) {
    progressBar.addEventListener('input', () => {
      const totalDuration = getAudioDuration();
      if (!totalDuration) return;
      const seekTime = (progressBar.value / 100) * totalDuration;
      if (currentTimeEl) currentTimeEl.innerText = formatTime(seekTime);
    });

    progressBar.addEventListener('change', () => {
      const totalDuration = getAudioDuration();
      if (!totalDuration) return;
      const seekTime = (progressBar.value / 100) * totalDuration;
      audio.currentTime = seekTime;
    });
  }
}

// Tạo hiệu ứng trái tim trôi nhẹ ở background
function createHearts() {
  const container = document.getElementById('heartsBg');
  if (!container) return;
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

document.addEventListener('DOMContentLoaded', () => {
  createHearts();
  initAudioPlayer();
});
