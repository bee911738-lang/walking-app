/* =============================================
   걷기앱 — script.js
   색상: 파란색 + 남보라색
   기능: 미션 뽑기, 점수, 레벨, 배지, 스트릭, 목표 설정, 다크모드
   ============================================= */

// =============================================
// [1] 미션 데이터
// =============================================

const missionData = {
  '전체': [],  // init()에서 모든 카테고리 합쳐서 채워짐

  '교실': [
    { text: '자리에서 일어나 교실 뒤편까지 천천히 걸어갔다 오기 (2회)',      diff: 'easy' },
    { text: '창문 옆에 서서 10초 동안 먼 곳 바라보며 스트레칭하기',          diff: 'easy' },
    { text: '자리에서 발뒤꿈치 들었다 내리기 20회',                          diff: 'easy' },
    { text: '쉬는 시간에 복도까지 걸어가서 물 한 컵 마시고 오기',            diff: 'mid'  },
    { text: '친구와 함께 교실 한 바퀴 빠르게 돌기',                          diff: 'mid'  },
    { text: '수업 시작 전 자리에서 허리·목 스트레칭 각 30초씩',              diff: 'mid'  },
    { text: '쉬는 시간 10분 동안 교실 뒤-앞 빠르게 왕복 5번',               diff: 'hard' },
    { text: '책상 옆에서 스쿼트 10회 × 2세트 도전',                         diff: 'hard' },
  ],

  '복도·계단': [
    { text: '복도 한쪽 끝에서 반대쪽까지 천천히 걷기',                       diff: 'easy' },
    { text: '계단 1층 오르고 엘리베이터 대신 걸어서 내려오기',               diff: 'easy' },
    { text: '복도를 걸으면서 팔을 크게 흔들어 보기',                         diff: 'easy' },
    { text: '계단 2층 연속 오르기 (쉬지 않고)',                              diff: 'mid'  },
    { text: '복도 왕복 3번을 1분 안에 완료하기',                             diff: 'mid'  },
    { text: '계단 오를 때 한 칸씩 두 발로 꼭꼭 밟으며 올라가기 3층',        diff: 'mid'  },
    { text: '계단 3층 이상 멈추지 않고 오르기',                              diff: 'hard' },
    { text: '복도에서 런지 자세로 10m 이동하기',                             diff: 'hard' },
  ],

  '집': [
    { text: '소파에서 일어나 집 안 한 바퀴 천천히 걷기',                     diff: 'easy' },
    { text: 'TV 광고 시간에 제자리 걷기 (발 번갈아 들기)',                    diff: 'easy' },
    { text: '발끝으로 서서 10초 버티기 × 3회',                              diff: 'easy' },
    { text: '집 안을 종종걸음으로 5분 동안 걷기',                            diff: 'mid'  },
    { text: '계단 있는 집이라면 위아래 5번 오르내리기',                      diff: 'mid'  },
    { text: '음악 한 곡 트는 동안 제자리에서 계속 걷기',                     diff: 'mid'  },
    { text: '집 안에서 1,000보 걷기 (폰 만보계 확인)',                       diff: 'hard' },
    { text: '줄넘기 또는 제자리 뛰기 100회 도전',                            diff: 'hard' },
  ],

  '어디서든': [
    { text: '앉았다 일어서기(스탠드업) 10회',                                diff: 'easy' },
    { text: '눈 감고 한 발로 10초 버티기 (양쪽)',                            diff: 'easy' },
    { text: '어깨 돌리기 앞뒤 각 10회',                                      diff: 'easy' },
    { text: '팔 뻗어 크게 스트레칭 1분',                                     diff: 'easy' },
    { text: '제자리 높이뛰기 20회',                                          diff: 'mid'  },
    { text: '허리 굽혀 발끝 터치 × 15회',                                   diff: 'mid'  },
    { text: '벽 짚고 푸시업 자세 15회',                                      diff: 'mid'  },
    { text: '플랭크 30초 × 2세트',                                           diff: 'hard' },
    { text: '버피 10회 도전 (전신 운동)',                                     diff: 'hard' },
    { text: '런지 좌우 각 15회 × 2세트',                                     diff: 'hard' },
  ]
};

// 전체 = 모든 카테고리 합치기
missionData['전체'] = [
  ...missionData['교실'],
  ...missionData['복도·계단'],
  ...missionData['집'],
  ...missionData['어디서든']
];

// =============================================
// [2] 난이도 정보
// =============================================

const DIFF = {
  easy: { label: '🟢 쉬움',  pts: 10, cls: 'diff-easy' },
  mid:  { label: '🟡 보통',  pts: 15, cls: 'diff-mid'  },
  hard: { label: '🔵 어려움', pts: 20, cls: 'diff-hard' }
};

// =============================================
// [3] 레벨 정보
// =============================================

const levels = [
  { minScore:   0, name: '🌱 씨앗',    next: '40점이면 새싹 레벨!' },
  { minScore:  40, name: '🌿 새싹',    next: '100점이면 달리기 레벨!' },
  { minScore: 100, name: '🏃 달리기',  next: '180점이면 걷기 고수!' },
  { minScore: 180, name: '🚴 걷기 고수', next: '300점이면 걷기 챔피언!' },
  { minScore: 300, name: '🏆 걷기 챔피언', next: '최고 레벨 달성! 🎉' }
];

// =============================================
// [4] 배지 정의
// =============================================

const BADGES = [
  { id: 'first_step',      icon: '🚀', name: '첫 걸음',      desc: '첫 번째 미션 완료!',           check: s => s.totalMissions >= 1  },
  { id: 'hard_challenger', icon: '💪', name: '도전자',        desc: '어려운 미션 1회 완료',         check: s => s.hardCount >= 1       },
  { id: 'triple',          icon: '⭐', name: '세 번의 도전',  desc: '미션 3회 완료',                check: s => s.totalMissions >= 3  },
  { id: 'streak_3',        icon: '🔥', name: '3일 연속',      desc: '3일 연속 미션 달성!',          check: s => s.streak >= 3         },
  { id: 'five_missions',   icon: '🏅', name: '꾸준한 걷기왕', desc: '미션 5회 완료',                check: s => s.totalMissions >= 5  },
  { id: 'goal_clear',      icon: '🎯', name: '목표 달성!',    desc: '하루 목표 횟수 달성',          check: s => s.goalClearedToday    },
  { id: 'score_100',       icon: '💎', name: '점수 부자',     desc: '누적 점수 100점 달성',         check: s => s.totalScore >= 100   },
  { id: 'champion',        icon: '🏆', name: '걷기 챔피언',   desc: '누적 점수 300점 달성',         check: s => s.totalScore >= 300   }
];

const MAX_HISTORY = 20;
const GOAL_MIN = 1;
const GOAL_MAX = 10;

// =============================================
// [5] HTML 요소
// =============================================

const missionCard        = document.getElementById('missionCard');
const missionPlaceholder = document.getElementById('missionPlaceholder');
const missionText        = document.getElementById('missionText');
const diffBadge          = document.getElementById('diffBadge');
const missionCountEl     = document.getElementById('missionCount');
const totalScoreEl       = document.getElementById('totalScore');
const levelBadgeEl       = document.getElementById('levelBadge');
const levelNextEl        = document.getElementById('levelNext');
const drawBtn            = document.getElementById('drawBtn');
const doneBtn            = document.getElementById('doneBtn');
const successMsg         = document.getElementById('successMsg');
const historyList        = document.getElementById('historyList');
const historyEmpty       = document.getElementById('historyEmpty');
const toggleArrow        = document.getElementById('toggleArrow');
const todayDateEl        = document.getElementById('todayDate');
const darkIconEl         = document.getElementById('darkIcon');
const badgeGrid          = document.getElementById('badgeGrid');
const badgeArrow         = document.getElementById('badgeArrow');
const shareBody          = document.getElementById('shareBody');
const shareArrow         = document.getElementById('shareArrow');
const shareTextEl        = document.getElementById('shareText');
const shareCopied        = document.getElementById('shareCopied');
const nativeShareBtn     = document.getElementById('nativeShareBtn');
const streakCountEl      = document.getElementById('streakCount');
const streakSubEl        = document.getElementById('streakSub');
const streakFireEl       = document.getElementById('streakFire');
const goalRingFill       = document.getElementById('goalRingFill');
const goalRingText       = document.getElementById('goalRingText');
const goalValueEl        = document.getElementById('goalValue');

// =============================================
// [6] 상태 변수
// =============================================

let currentCategory = '전체';
let currentMission  = null;
let successTimer    = null;

// =============================================
// [A] 다크모드
// =============================================

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  darkIconEl.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark ? 'on' : 'off');
}

function loadDarkMode() {
  if (localStorage.getItem('darkMode') === 'on') {
    document.body.classList.add('dark');
    darkIconEl.textContent = '☀️';
  }
}

// =============================================
// [B] 날짜 표시
// =============================================

function renderDate() {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const now  = new Date();
  todayDateEl.textContent =
    `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
}

// =============================================
// [C] localStorage 데이터 관리
// =============================================

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadData() {
  const today     = getTodayKey();
  const yesterday = getYesterdayKey();
  const raw  = localStorage.getItem('walkingApp');
  const data = raw ? JSON.parse(raw) : {};

  // 날짜가 달라졌으면 오늘 카운트 리셋
  const todayCount = data.date === today ? (data.todayCount || 0) : 0;

  // 스트릭 계산
  // - 오늘 이미 미션 완료한 경우 → 유지
  // - 어제 완료한 기록이 있으면 → streak 유지
  // - 그 외 → streak 리셋
  let streak = data.streak || 0;
  if (data.date !== today && data.date !== yesterday) {
    streak = 0; // 하루 이상 공백 → 리셋
  }

  return {
    todayCount:       todayCount,
    totalScore:       data.totalScore    || 0,
    totalMissions:    data.totalMissions || 0,
    hardCount:        data.hardCount     || 0,
    earnedBadges:     data.earnedBadges  || [],
    history:          data.history       || [],
    date:             today,
    streak:           streak,
    streakUpdatedDay: data.streakUpdatedDay || '',
    dailyGoal:        data.dailyGoal || 3,
    goalClearedToday: false // 런타임에서만 사용
  };
}

function saveData(state) {
  localStorage.setItem('walkingApp', JSON.stringify(state));
}

// =============================================
// [D] 카테고리 선택
// =============================================

function selectCategory(chipEl) {
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');
  currentCategory = chipEl.dataset.cat;
  resetMissionCard();
}

function resetMissionCard() {
  currentMission            = null;
  missionText.hidden        = true;
  diffBadge.hidden          = true;
  missionPlaceholder.hidden = false;
  missionCard.classList.remove('has-mission');
  doneBtn.disabled = true;
  hideSuccessMsg();
}

// =============================================
// [E] 미션 뽑기
// =============================================

function drawMission() {
  const pool = missionData[currentCategory];
  currentMission = pool[Math.floor(Math.random() * pool.length)];

  const d = DIFF[currentMission.diff];
  missionText.textContent   = currentMission.text;
  missionText.hidden        = false;
  missionPlaceholder.hidden = true;
  diffBadge.textContent = `${d.label}  +${d.pts}점`;
  diffBadge.className   = `diff-badge ${d.cls}`;
  diffBadge.hidden      = false;
  missionCard.classList.add('has-mission');
  doneBtn.disabled = false;
  hideSuccessMsg();
}

// =============================================
// [F] 미션 완료 처리
// =============================================

function completeMission() {
  if (!currentMission) return;

  const pts   = DIFF[currentMission.diff].pts;
  const state = loadData();
  const today = getTodayKey();

  state.todayCount    += 1;
  state.totalScore    += pts;
  state.totalMissions += 1;
  if (currentMission.diff === 'hard') state.hardCount += 1;

  // 스트릭 업데이트
  if (state.streakUpdatedDay !== today) {
    // 오늘 처음 완료 → streak+1 (어제 했거나 오늘 처음)
    state.streak += 1;
    state.streakUpdatedDay = today;
  }

  // 목표 달성 여부
  state.goalClearedToday = state.todayCount >= state.dailyGoal;

  const timeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  state.history.unshift({
    text: currentMission.text,
    time: timeStr,
    pts,
    diff: DIFF[currentMission.diff].label
  });
  if (state.history.length > MAX_HISTORY) {
    state.history = state.history.slice(0, MAX_HISTORY);
  }

  const newBadges = checkBadges(state);
  saveData(state);

  renderScore(state);
  renderStreak(state);
  renderGoal(state);
  renderHistory(state.history);
  renderBadges(state.earnedBadges);
  popNumber(missionCountEl);
  popNumber(totalScoreEl);

  const prevLevel    = getLevelInfo(state.totalScore - pts);
  const currentLevel = getLevelInfo(state.totalScore);

  if (newBadges.length > 0) {
    showSuccessMsg(`🏅 새 배지 획득: ${newBadges.map(b => b.icon + ' ' + b.name).join(', ')}!`);
  } else if (state.goalClearedToday && state.todayCount === state.dailyGoal) {
    showSuccessMsg(`🎯 오늘 목표 ${state.dailyGoal}회 달성! 대단해요!`);
  } else if (currentLevel.name !== prevLevel.name) {
    showSuccessMsg(`🎊 레벨 업! ${currentLevel.name} 달성!`);
  } else {
    showSuccessMsg(`🎉 +${pts}점 획득! 한 걸음 더 나아갔어요!`);
  }

  resetMissionCard();
}

// =============================================
// [G] 점수 & 레벨 렌더링
// =============================================

function renderScore(state) {
  missionCountEl.textContent = state.todayCount;
  totalScoreEl.textContent   = state.totalScore;
  const lv = getLevelInfo(state.totalScore);
  levelBadgeEl.textContent = lv.name;
  levelNextEl.textContent  = lv.next;
}

function getLevelInfo(score) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (score >= levels[i].minScore) return levels[i];
  }
  return levels[0];
}

// =============================================
// [H] 스트릭 렌더링
// =============================================

function renderStreak(state) {
  streakCountEl.textContent = state.streak;

  if (state.streak === 0) {
    streakFireEl.textContent = '🔥';
    streakSubEl.textContent  = '오늘 미션 완료 시 시작!';
  } else if (state.streak < 3) {
    streakFireEl.textContent = '🔥';
    streakSubEl.textContent  = `${state.streak}일째 계속 중!`;
  } else if (state.streak < 7) {
    streakFireEl.textContent = '🔥🔥';
    streakSubEl.textContent  = `${state.streak}일 연속! 불꽃 🔥`;
  } else {
    streakFireEl.textContent = '🔥🔥🔥';
    streakSubEl.textContent  = `${state.streak}일 연속! 전설 ✨`;
  }
}

// =============================================
// [I] 목표 설정 렌더링
// =============================================

function renderGoal(state) {
  const done  = state.todayCount;
  const goal  = state.dailyGoal;
  const ratio = Math.min(done / goal, 1);
  const circumference = 157; // 2π×25

  goalRingFill.style.strokeDashoffset = circumference - ratio * circumference;
  goalRingText.textContent = `${done}/${goal}`;
  goalValueEl.textContent  = `목표: ${goal}회`;

  // 달성 시 링 색상 변경
  goalRingFill.style.stroke = ratio >= 1 ? 'var(--blue-main)' : 'var(--indigo-main)';
}

function changeGoal(delta) {
  const state = loadData();
  state.dailyGoal = Math.max(GOAL_MIN, Math.min(GOAL_MAX, (state.dailyGoal || 3) + delta));
  saveData(state);
  renderGoal(state);
}

// =============================================
// [J] 배지 시스템
// =============================================

function checkBadges(state) {
  const newBadges = [];
  BADGES.forEach(badge => {
    if (!state.earnedBadges.includes(badge.id) && badge.check(state)) {
      state.earnedBadges.push(badge.id);
      newBadges.push(badge);
    }
  });
  return newBadges;
}

function renderBadges(earnedBadges) {
  badgeGrid.innerHTML = BADGES.map(badge => {
    const isEarned = earnedBadges.includes(badge.id);
    return `
      <div class="badge-card ${isEarned ? 'earned' : ''}">
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-name">${badge.name}</span>
        <span class="badge-desc">${badge.desc}</span>
        <span class="badge-check">✔ 획득!</span>
      </div>
    `;
  }).join('');
}

function toggleBadges() {
  const isHidden = badgeGrid.hidden;
  badgeGrid.hidden = !isHidden;
  badgeArrow.classList.toggle('open', isHidden);
}

// =============================================
// [K] 기록 렌더링
// =============================================

function renderHistory(history) {
  if (history.length === 0) {
    historyList.hidden  = true;
    historyEmpty.hidden = false;
    return;
  }
  historyEmpty.hidden = true;
  historyList.hidden  = false;
  historyList.innerHTML = history.map(item => `
    <li>
      <span class="hist-text">${item.text}</span>
      <span class="hist-meta">
        <span class="hist-diff">${item.diff || ''}</span>
        <span class="hist-time">${item.time}</span>
        <span class="hist-pts">+${item.pts}점</span>
      </span>
    </li>
  `).join('');
}

function toggleHistory() {
  const isHidden = historyList.hidden && historyEmpty.hidden;
  if (isHidden) {
    const state = loadData();
    renderHistory(state.history);
    if (state.history.length === 0) historyEmpty.hidden = false;
    else historyList.hidden = false;
    toggleArrow.classList.add('open');
  } else {
    historyList.hidden  = true;
    historyEmpty.hidden = true;
    toggleArrow.classList.remove('open');
  }
}

// =============================================
// [L] 완료 메시지
// =============================================

function showSuccessMsg(text) {
  if (successTimer) clearTimeout(successTimer);
  successMsg.textContent = text;
  successMsg.hidden = false;
  successTimer = setTimeout(hideSuccessMsg, 3000);
}

function hideSuccessMsg() {
  successMsg.hidden = true;
  if (successTimer) { clearTimeout(successTimer); successTimer = null; }
}

// =============================================
// [M] 팝 애니메이션
// =============================================

function popNumber(el) {
  el.classList.remove('pop');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('pop')));
  setTimeout(() => el.classList.remove('pop'), 250);
}

// =============================================
// [N] 공유 문구 만들기
// =============================================

function buildShareText(state) {
  const lv    = getLevelInfo(state.totalScore);
  const goal  = state.dailyGoal;
  const done  = state.todayCount;
  const today = new Date();
  const days  = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}요일`;

  const goalLine = done >= goal
    ? `🎯 오늘 목표 ${goal}회 달성! 완료!`
    : `📌 오늘 목표: ${goal}회 중 ${done}회 완료`;

  const streakLine = state.streak >= 1
    ? `🔥 ${state.streak}일 연속 달성 중!`
    : '';

  const lines = [
    `🚶 걷기앱 오늘의 기록 — ${dateStr}`,
    ``,
    `✅ 오늘 완료한 미션: ${done}회`,
    goalLine,
    `💎 누적 점수: ${state.totalScore}점`,
    `🏅 현재 레벨: ${lv.name}`,
    streakLine,
    ``,
    `#걷기앱 #건강습관 #고등학생운동 #오늘도한걸음`,
  ].filter(l => l !== null && l !== undefined);

  return lines.join('\n');
}

function toggleShare() {
  const isHidden = shareBody.hidden;
  shareBody.hidden = !isHidden;
  shareArrow.classList.toggle('open', isHidden);

  if (isHidden) {
    // 열릴 때마다 최신 데이터로 문구 생성
    const state = loadData();
    shareTextEl.value = buildShareText(state);
    shareCopied.hidden = true;

    // Web Share API 지원 여부에 따라 버튼 표시
    nativeShareBtn.hidden = !navigator.share;
  }
}

let copyTimer = null;

function copyShare() {
  if (!shareTextEl.value) return;
  navigator.clipboard.writeText(shareTextEl.value)
    .then(() => {
      shareCopied.hidden = false;
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { shareCopied.hidden = true; }, 2500);
    })
    .catch(() => {
      // clipboard API 미지원 시 fallback
      shareTextEl.select();
      document.execCommand('copy');
      shareCopied.hidden = false;
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { shareCopied.hidden = true; }, 2500);
    });
}

function nativeShare() {
  if (!navigator.share) return;
  navigator.share({
    title: '걷기앱 오늘의 기록',
    text: shareTextEl.value
  }).catch(() => {}); // 사용자가 취소하면 무시
}

// =============================================
// [O] 데이터 초기화 (리셋)
// =============================================

function openResetModal() {
  const modal = document.getElementById('resetModal');
  modal.hidden = false;
  modal.classList.remove('is-open');
  requestAnimationFrame(() => modal.classList.add('is-open'));
}

function closeResetModal() {
  const modal = document.getElementById('resetModal');
  modal.hidden = true;
  modal.classList.remove('is-open');
}

function confirmReset() {
  const prevGoal = loadData().dailyGoal; // 목표 횟수는 보존
  localStorage.removeItem('walkingApp');
  const fresh = loadData();
  fresh.dailyGoal = prevGoal;
  saveData(fresh);
  closeResetModal();
  renderScore(fresh);
  renderStreak(fresh);
  renderGoal(fresh);
  renderBadges(fresh.earnedBadges);
  historyList.innerHTML = '';
  historyList.hidden    = true;
  historyEmpty.hidden   = true;
  toggleArrow.classList.remove('open');
  badgeGrid.hidden = true;
  badgeArrow.classList.remove('open');
  resetMissionCard();
  showSuccessMsg('🔄 모든 데이터가 초기화됐어요. 다시 시작해 보세요!');
}

// =============================================
// [O] 앱 초기화
// =============================================

(function init() {
  loadDarkMode();
  renderDate();
  const state = loadData();
  renderScore(state);
  renderStreak(state);
  renderGoal(state);
  renderBadges(state.earnedBadges);

  // 모달 오버레이 바깥 클릭 시 닫기
  document.getElementById('resetModal').addEventListener('click', function(e) {
    if (e.target === this) closeResetModal();
  });
})();
