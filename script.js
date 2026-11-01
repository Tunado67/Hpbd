// Chuyển bước giữa các Screen
function goToStep(stepNumber) {
  const steps = document.querySelectorAll('.step');
  steps.forEach(step => step.classList.remove('active'));

  const targetStep = document.getElementById(`step${stepNumber}`);
  if (targetStep) {
    targetStep.classList.add('active');
  }

  // Nếu chuyển ra khỏi Step 2 (Music Player), tạm dừng nhạc
  if (stepNumber !== 2) {
    const audio = document.getElementById('audioPlayer');
    if (audio && !audio.paused) {
      audio.pause();
    }
  }
}

// Format seconds into m:ss format
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Khởi tạo Vinyl Audio Player
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

  if (!audio || !playPauseBtn) return;

  function updatePlayState(isPlaying) {
    if (isPlaying) {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      vinylRecord.classList.add('playing');
      if (recordPlayer) recordPlayer.classList.add('playing');
    } else {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      vinylRecord.classList.remove('playing');
      if (recordPlayer) recordPlayer.classList.remove('playing');
    }
  }

  // Play / Pause toggle
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        updatePlayState(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    } else {
      audio.pause();
      updatePlayState(false);
    }
  });

  audio.addEventListener('play', () => updatePlayState(true));
  audio.addEventListener('pause', () => updatePlayState(false));

  // Khi hết bài hát
  audio.addEventListener('ended', () => {
    updatePlayState(false);
    audio.currentTime = 0;
    progressBar.value = 0;
    currentTimeEl.innerText = '0:00';
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
    progressBar.value = Math.min(100, Math.max(0, progressPercent));
    currentTimeEl.innerText = formatTime(audio.currentTime);
  });

  // Tua nhạc khi kéo hoặc click thanh thời gian
  progressBar.addEventListener('input', () => {
    const totalDuration = getAudioDuration();
    if (!totalDuration) return;
    const seekTime = (progressBar.value / 100) * totalDuration;
    currentTimeEl.innerText = formatTime(seekTime);
  });

  progressBar.addEventListener('change', () => {
    const totalDuration = getAudioDuration();
    if (!totalDuration) return;
    const seekTime = (progressBar.value / 100) * totalDuration;
    audio.currentTime = seekTime;
  });
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
