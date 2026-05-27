// =============================================
// 걷기앱 — script.js
// 기능: 카테고리 선택, 미션 뽑기, 완료 처리,
//       점수·레벨 표시, 최근 완료 기록,
//       다크모드 토글, 오늘 날짜 표시
// =============================================

// ----- 1. 카테고리별 미션 목록 -----
const missionData = {
  '전체': [
    "🖼️ 교실 뒤편 게시판까지 천천히 걸어갔다 돌아오기",
    "🦵 제자리에서 가볍게 20걸음 걸으며 무릎 높여주기",
    "📚 다음 교시 수업 준비를 마치고 복도 끝까지 한 바퀴 걷고 오기",
    "🚰 물 마시러 정수기나 매점까지 일부러 조금 돌아가기",
    "👋 친구 자리에 걸어가서 가벼운 인사 나누고 오기",
    "🪜 계단을 한 층만 위아래로 천천히 걸어 다녀오기",
    "👟 발뒤꿈치를 들고 제자리에서 15걸음 걸어보기",
    "🌤️ 창가로 걸어가서 바깥 풍경을 보며 10초 동안 제자리 걷기",
    "🏠 집 방 안에서 거실까지 왕복으로 3번 걸어 다니기",
    "🎵 좋아하는 노래 한 곡이 끝날 때까지 방 안을 자유롭게 걷기",
    "💪 오늘 세운 학습 목표를 마음속으로 되새기며 제자리 걷기 50번",
    "🧍 허리를 곧게 펴고 바른 자세로 교실 한 바퀴 크게 돌기"
  ],
  '교실': [
    "🖼️ 교실 뒤편 게시판까지 천천히 걸어갔다 돌아오기",
    "👋 친구 자리에 걸어가서 가벼운 인사 나누고 오기",
    "🌤️ 창가로 걸어가서 바깥 풍경을 보며 10초 동안 제자리 걷기",
    "🧍 허리를 곧게 펴고 바른 자세로 교실 한 바퀴 크게 돌기"
  ],
  '복도·계단': [
    "📚 다음 교시 수업 준비를 마치고 복도 끝까지 한 바퀴 걷고 오기",
    "🚰 물 마시러 정수기나 매점까지 일부러 조금 돌아가기",
    "🪜 계단을 한 층만 위아래로 천천히 걸어 다녀오기"
  ],
  '집': [
    "🏠 집 방 안에서 거실까지 왕복으로 3번 걸어 다니기",
    "🎵 좋아하는 노래 한 곡이 끝날 때까지 방 안을 자유롭게 걷기"
  ],
  '어디서든': [
    "🦵 제자리에서 가볍게 20걸음 걸으며 무릎 높여주기",
    "👟 발뒤꿈치를 들고 제자리에서 15걸음 걸어보기",
    "💪 오늘 세운 학습 목표를 마음속으로 되새기며 제자리 걷기 50번"
  ]
};

// ----- 2. 레벨 정의 -----
const levels = [
  { minScore:   0, name: "🌱 씨앗",       next: "30점이면 새싹!" },
  { minScore:  30, name: "🌿 새싹",       next: "70점이면 걷기 입문!" },
  { minScore:  70, name: "🚶 걷기 입문",  next: "120점이면 걷기 고수!" },
  { minScore: 120, name: "🏃 걷기 고수",  next: "200점이면 걷기 챔피언!" },
  { minScore: 200, name: "🏆 걷기 챔피언", next: "최고 레벨 달성! 🎉" }
];

// ----- 3. 상수 -----
const POINTS_PER_MISSION = 10; // 미션 1회 = 10점
const MAX_HISTORY        = 20; // 최근 기록 최대 보관 수

// ----- 4. HTML 요소 가져오기 -----
const missionCard        = document.getElementById("missionCard");
const missionPlaceholder = document.getElementById("missionPlaceholder");
const missionText        = document.getElementById("missionText");
const missionCountEl     = document.getElementById("missionCount");
const totalScoreEl       = document.getElementById("totalScore");
const levelBadgeEl       = document.getElementById("levelBadge");
const levelNextEl        = document.getElementById("levelNext");
const drawBtn            = document.getElementById("drawBtn");
const doneBtn            = document.getElementById("doneBtn");
const successMsg         = document.getElementById("successMsg");
const historyList        = document.getElementById("historyList");
const historyEmpty       = document.getElementById("historyEmpty");
const toggleArrow        = document.getElementById("toggleArrow");
const todayDateEl        = document.getElementById("todayDate");
const darkToggleBtn      = document.getElementById("darkToggle");
const darkIconEl         = document.getElementById("darkIcon");

// ----- 5. 상태 변수 -----
let currentCategory = '전체';
let successTimer    = null;

// =============================================
// [A] 다크모드
// =============================================

// A-1. 다크모드 토글 — 버튼을 누르면 실행
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark'); // 클래스 추가/제거
  darkIconEl.textContent = isDark ? '☀️' : '🌙';        // 아이콘 변경
  localStorage.setItem('darkMode', isDark ? 'on' : 'off'); // 설정 저장
}

// A-2. 저장된 다크모드 설정 불러오기
function loadDarkMode() {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'on') {
    document.body.classList.add('dark');
    darkIconEl.textContent = '☀️';
  }
}

// =============================================
// [B] 오늘 날짜 표시
// =============================================

// B-1. 날짜를 "2025년 5월 27일 화요일" 형식으로 반환
function formatKoreanDate() {
  const days  = ['일', '월', '화', '수', '목', '금', '토']; // 요일 배열
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;  // getMonth()는 0부터 시작
  const day   = now.getDate();
  const dayOfWeek = days[now.getDay()];
  return `${year}년 ${month}월 ${day}일 ${dayOfWeek}요일`;
}

// B-2. 날짜 요소에 오늘 날짜 표시
function renderDate() {
  todayDateEl.textContent = formatKoreanDate();
}

// =============================================
// [C] localStorage 데이터 관리
// =============================================

// 오늘 날짜 키 (예: "2025-05-20") — 날짜별 기록 구분용
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// 저장된 데이터 불러오기 (없으면 기본값)
function loadData() {
  const today = getTodayKey();
  const raw   = localStorage.getItem('walkingApp');
  const data  = raw ? JSON.parse(raw) : {};

  return {
    todayCount: data.date === today ? (data.todayCount || 0) : 0, // 날짜 바뀌면 오늘 횟수 초기화
    totalScore: data.totalScore || 0,
    history:    data.history   || [],
    date:       today
  };
}

// 데이터 저장
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

  missionText.hidden        = true;
  missionPlaceholder.hidden = false;
  missionCard.classList.remove('has-mission');
  doneBtn.disabled = true;
  hideSuccessMsg();
}

// =============================================
// [E] 미션 뽑기
// =============================================

function drawMission() {
  const pool   = missionData[currentCategory];
  const picked = pool[Math.floor(Math.random() * pool.length)];

  missionText.textContent   = picked;
  missionText.hidden        = false;
  missionPlaceholder.hidden = true;
  missionCard.classList.add('has-mission');
  doneBtn.disabled = false;
  hideSuccessMsg();
}

// =============================================
// [F] 미션 완료 처리
// =============================================

function completeMission() {
  const completedMission = missionText.textContent;

  // 데이터 갱신
  const state = loadData();
  state.todayCount += 1;
  state.totalScore += POINTS_PER_MISSION;

  // 완료 기록 추가 (최신 항목이 맨 위)
  const timeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  state.history.unshift({ text: completedMission, time: timeStr, pts: POINTS_PER_MISSION });
  if (state.history.length > MAX_HISTORY) {
    state.history = state.history.slice(0, MAX_HISTORY);
  }

  saveData(state); // localStorage에 저장

  // 화면 갱신
  renderScore(state);
  renderHistory(state.history);

  // 숫자 팝 애니메이션
  popNumber(missionCountEl);
  popNumber(totalScoreEl);

  // 레벨업 여부 확인 후 완료 메시지
  const prevLevel    = getLevelInfo(state.totalScore - POINTS_PER_MISSION);
  const currentLevel = getLevelInfo(state.totalScore);
  if (currentLevel.name !== prevLevel.name) {
    showSuccessMsg(`🎊 레벨 업! ${currentLevel.name} 달성!`);
  } else {
    showSuccessMsg("🎉 잘 했어요! 한 걸음 더 나아갔어요!");
  }

  // 카드 초기화
  missionText.hidden        = true;
  missionPlaceholder.hidden = false;
  missionCard.classList.remove('has-mission');
  doneBtn.disabled = true;
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

// 점수에 해당하는 레벨 객체 반환
function getLevelInfo(score) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (score >= levels[i].minScore) return levels[i];
  }
  return levels[0];
}

// =============================================
// [H] 완료 기록 렌더링
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
        <span class="hist-time">${item.time}</span>
        <span class="hist-pts">+${item.pts}점</span>
      </span>
    </li>
  `).join('');
}

// 기록 섹션 열기/닫기
function toggleHistory() {
  const isHidden = historyList.hidden && historyEmpty.hidden;

  if (isHidden) {
    const state = loadData();
    renderHistory(state.history); // 최신 기록 반영
    if (state.history.length === 0) {
      historyEmpty.hidden = false;
    } else {
      historyList.hidden = false;
    }
    toggleArrow.classList.add('open');
  } else {
    historyList.hidden  = true;
    historyEmpty.hidden = true;
    toggleArrow.classList.remove('open');
  }
}

// =============================================
// [I] 완료 메시지 표시/숨김
// =============================================

function showSuccessMsg(text) {
  if (successTimer) clearTimeout(successTimer);
  successMsg.textContent = text;
  successMsg.hidden = false;
  successTimer = setTimeout(hideSuccessMsg, 2800);
}

function hideSuccessMsg() {
  successMsg.hidden = true;
  if (successTimer) { clearTimeout(successTimer); successTimer = null; }
}

// =============================================
// [J] 숫자 팝 애니메이션
// =============================================

function popNumber(el) {
  el.classList.remove('pop');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('pop'));
  });
  setTimeout(() => el.classList.remove('pop'), 250);
}

// =============================================
// [K] 앱 초기화 (페이지 로드 시 자동 실행)
// =============================================

(function init() {
  loadDarkMode();         // 다크모드 설정 복원
  renderDate();           // 오늘 날짜 표시
  const state = loadData();
  renderScore(state);     // 점수·레벨 표시
})();
